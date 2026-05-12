package com.moodrec.service;

import com.moodrec.dto.response.RecommendationResponse;
import com.moodrec.dto.response.RecommendationResponse.RecItem;
import com.moodrec.dto.response.RecommendationResponse.RecommendationGroups;
import com.moodrec.exception.ResourceNotFoundException;
import com.moodrec.model.*;
import com.moodrec.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    private final MoodHistoryRepository moodHistoryRepository;
    private final RecommendationRepository recommendationRepository;
    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final ExternalApiService externalApiService;

    // Mood → TMDB genre IDs mapping
    private static final Map<String, String> MOOD_GENRE_MAP = Map.of(
        "happy",    "35,10402",   // Comedy, Music
        "sad",      "18,10749",   // Drama, Romance
        "angry",    "28,12",      // Action, Adventure
        "fearful",  "99,36",      // Documentary, History
        "disgusted","35,16",      // Comedy, Animation
        "surprised","878,12",     // Sci-Fi, Adventure
        "neutral",  "18,53",      // Drama, Thriller
        "stressed", "99,10751",   // Documentary, Family
        "calm",     "10402,36",   // Music, History
        "energetic","28,878"      // Action, Sci-Fi
    );

    // Mood → Spotify energy/valence targets
    private static final Map<String, double[]> MOOD_AUDIO_MAP = Map.of(
        "happy",    new double[]{0.8, 0.9},
        "sad",      new double[]{0.3, 0.2},
        "angry",    new double[]{0.9, 0.3},
        "stressed", new double[]{0.4, 0.5},
        "calm",     new double[]{0.3, 0.7},
        "energetic",new double[]{0.95, 0.8},
        "neutral",  new double[]{0.5, 0.5},
        "fearful",  new double[]{0.5, 0.3},
        "surprised",new double[]{0.7, 0.7},
        "disgusted",new double[]{0.6, 0.4}
    );

    @Transactional
    public RecommendationResponse getRecommendations(UUID moodHistoryId, String email, int limit) {
        MoodHistory moodHistory = moodHistoryRepository.findById(moodHistoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Mood session not found"));

        User user = userRepository.findByEmail(email).orElseThrow();
        String mood = moodHistory.getMood().toLowerCase().trim();

        // Check cache: if recs already generated for this session, return them
        List<Recommendation> cached = recommendationRepository
                .findByMoodHistoryIdOrderByScoreDesc(moodHistoryId);
        if (!cached.isEmpty()) {
            return buildResponse(moodHistory, cached, user.getId());
        }

        // Fetch liked external IDs to avoid recommending the same content
        Set<String> likedIds = feedbackRepository.findLikedByUserId(user.getId()).stream()
                .map(f -> f.getRecommendation().getExternalId())
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // Fetch from external APIs
        List<RecItem> movies    = externalApiService.fetchMovies(mood, MOOD_GENRE_MAP, limit);
        List<RecItem> tracks    = externalApiService.fetchMusic(mood, MOOD_AUDIO_MAP, limit);
        List<RecItem> activities = externalApiService.fetchActivities(mood, limit);

        // Score and save
        List<Recommendation> allRecs = new ArrayList<>();
        allRecs.addAll(scoreAndSave(movies,     RecommendationType.MOVIE,    moodHistory, user, mood, likedIds));
        allRecs.addAll(scoreAndSave(tracks,     RecommendationType.MUSIC,    moodHistory, user, mood, likedIds));
        allRecs.addAll(scoreAndSave(activities, RecommendationType.ACTIVITY, moodHistory, user, mood, likedIds));

        recommendationRepository.saveAll(allRecs);
        return buildResponse(moodHistory, allRecs, user.getId());
    }

    private List<Recommendation> scoreAndSave(List<RecItem> items, RecommendationType type,
                                               MoodHistory moodHistory, User user,
                                               String mood, Set<String> likedIds) {
        return items.stream().map(item -> {
            double score = computeScore(item, mood, likedIds);
            return Recommendation.builder()
                    .moodHistory(moodHistory)
                    .user(user)
                    .type(type)
                    .externalId(item.getExternalId())
                    .title(item.getTitle())
                    .imageUrl(item.getImageUrl())
                    .reason(item.getReason())
                    .score(BigDecimal.valueOf(score))
                    .build();
        }).collect(Collectors.toList());
    }

    private double computeScore(RecItem item, String mood, Set<String> likedIds) {
        double base = item.getScore() != null ? item.getScore().doubleValue() : 0.5;
        // Boost if user previously liked this item
        double feedbackBoost = likedIds.contains(item.getExternalId()) ? 0.1 : 0.0;
        // Small random factor for diversity
        double diversity = Math.random() * 0.05;
        return Math.min(base + feedbackBoost + diversity, 1.0);
    }

    private RecommendationResponse buildResponse(MoodHistory mood,
                                                  List<Recommendation> recs, UUID userId) {
        // Get user feedback map for these recs
        Map<UUID, Boolean> feedbackMap = new HashMap<>();
        recs.forEach(r -> feedbackRepository.findByUserIdAndRecommendationId(userId, r.getId())
                .ifPresent(f -> feedbackMap.put(r.getId(),
                        f.getReaction() == Feedback.Reaction.LIKE)));

        List<RecItem> movies = toItems(recs, RecommendationType.MOVIE, feedbackMap);
        List<RecItem> music  = toItems(recs, RecommendationType.MUSIC,  feedbackMap);
        List<RecItem> acts   = toItems(recs, RecommendationType.ACTIVITY, feedbackMap);

        return RecommendationResponse.builder()
                .mood(mood.getMood())
                .confidence(mood.getConfidence())
                .recommendations(RecommendationGroups.builder()
                        .movies(movies).music(music).activities(acts).build())
                .build();
    }

    private List<RecItem> toItems(List<Recommendation> all, RecommendationType type,
                                   Map<UUID, Boolean> feedbackMap) {
        return all.stream()
                .filter(r -> r.getType() == type)
                .sorted(Comparator.comparing(Recommendation::getScore).reversed())
                .map(r -> RecItem.builder()
                        .id(r.getId()).externalId(r.getExternalId())
                        .title(r.getTitle()).imageUrl(r.getImageUrl())
                        .reason(r.getReason()).score(r.getScore())
                        .type(type.name()).liked(feedbackMap.get(r.getId()))
                        .build())
                .collect(Collectors.toList());
    }
}
