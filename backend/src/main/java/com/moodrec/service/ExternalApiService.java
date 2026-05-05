package com.moodrec.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.moodrec.dto.response.RecommendationResponse.RecItem;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@Slf4j
public class ExternalApiService {

    private final WebClient tmdbClient;
    private final String tmdbApiKey;

    private static final String TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

    public ExternalApiService(
            @Value("${external-apis.tmdb.base-url}") String tmdbBaseUrl,
            @Value("${external-apis.tmdb.api-key}") String tmdbApiKey,
            WebClient.Builder builder) {

        this.tmdbApiKey = tmdbApiKey;

        this.tmdbClient = builder.clone()
                .baseUrl(tmdbBaseUrl)
                .build();

        log.info("🔥 TMDB KEY: {}", tmdbApiKey.equals("your_tmdb_key") ? "❌ NOT SET" : "✅ OK");
    }

    // ───────── MOVIES ─────────
    public List<RecItem> fetchMovies(String mood, Map<String, String> moodGenreMap, int limit) {
        try {
            String genres = moodGenreMap.getOrDefault(mood, "18");

            JsonNode response = tmdbClient.get()
                    .uri(u -> u.path("/discover/movie")
                            .queryParam("api_key", tmdbApiKey)
                            .queryParam("with_genres", genres)
                            .build())
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            return StreamSupport.stream(response.get("results").spliterator(), false)
                    .limit(limit)
                    .map(n -> RecItem.builder()
                            .externalId(n.get("id").asText())
                            .title(n.get("title").asText())
                            .imageUrl(n.has("poster_path") && !n.get("poster_path").isNull()
                                    ? TMDB_IMAGE_BASE + n.get("poster_path").asText()
                                    : null)
                            .reason("Matches your mood: " + mood)
                            .score(BigDecimal.valueOf(0.7))
                            .build())
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("TMDB failed: {}", e.getMessage());
            return List.of();
        }
    }

    // ───────── MUSIC (FIXED: NO EMBED, ONLY SEARCH LINK) ─────────
    public List<RecItem> fetchMusic(String mood, Map<String, double[]> map, int limit) {

        Map<String, List<String>> music = Map.of(
                "happy", List.of("happy upbeat songs", "party songs"),
                "sad", List.of("sad songs", "emotional music"),
                "stressed", List.of("lofi music", "calm piano"),
                "angry", List.of("rage music", "metal playlist"),
                "calm", List.of("relaxing music", "meditation music"),
                "energetic", List.of("gym songs", "edm playlist"),
                "neutral", List.of("popular songs", "indie playlist")
        );

        return music.getOrDefault(mood, List.of("popular songs"))
                .stream()
                .limit(limit)
                .map(q -> RecItem.builder()
                        .externalId("yt-" + q.replace(" ", "-"))
                        .title(q)
                        .reason("Click to play on YouTube")
                        .score(BigDecimal.valueOf(0.7))
                        .build())
                .toList();
    }

    // ───────── ACTIVITIES (WITH IMAGES + MAPS) ─────────
    public List<RecItem> fetchActivities(String mood, int limit) {

        Map<String, List<RecItem>> map = Map.of(
                "sad", List.of(
                        act("Cafe near you", "Change your mood", "cafe near me"),
                        act("Park walk", "Fresh air helps", "park near me")
                ),
                "stressed", List.of(
                        act("Spa nearby", "Relax your body", "spa near me"),
                        act("Yoga class", "Reduce stress", "yoga near me")
                ),
                "energetic", List.of(
                        act("Gym", "Use your energy", "gym near me"),
                        act("Sports ground", "Play something", "sports ground near me")
                ),
                "calm", List.of(
                        act("Reading", "Relax your mind", "library near me"),
                        act("Sketching", "Be creative", "art studio near me")
                )
        );

        return map.getOrDefault(mood, map.get("sad"))
                .stream()
                .limit(limit)
                .toList();
    }

    private RecItem act(String title, String reason, String search) {
        return RecItem.builder()
                .externalId("act-" + title.replace(" ", "-").toLowerCase())
                .title(title)
                .imageUrl(getActivityImage(title))   // ✅ FIXED
                .reason(reason)
                .score(BigDecimal.valueOf(0.8))
                .build();
    }

    // ───────── ACTIVITY IMAGES (FIXED) ─────────
    private String getActivityImage(String title) {

        Map<String, String> images = Map.of(
                "Cafe near you", "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500",
                "Park walk", "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=500",
                "Reading", "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500",
                "Sketching", "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500",
                "Meditation", "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=500",
                "Gym", "https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=500",
                "Spa nearby", "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500",
                "Yoga class", "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500"
        );

        return images.getOrDefault(
                title,
                "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=500"
        );
    }
}