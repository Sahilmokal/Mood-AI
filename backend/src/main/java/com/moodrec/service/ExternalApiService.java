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

            if (response == null || !response.has("results")) return List.of();

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

    // ───────── 🔥 FIXED MUSIC (ALL MOODS) ─────────
    public List<RecItem> fetchMusic(String mood, Map<String, double[]> map, int limit) {

        mood = mood.toLowerCase().trim();
        log.info("🎵 Mood received: {}", mood);

        Map<String, List<String>> musicMap = new HashMap<>();

        musicMap.put("happy", List.of(
                "happy upbeat songs playlist",
                "feel good bollywood songs",
                "party songs hindi"
        ));

        musicMap.put("sad", List.of(
                "sad songs hindi",
                "breakup songs playlist",
                "emotional songs bollywood"
        ));

        musicMap.put("angry", List.of(
                "angry rock music",
                "rage workout songs",
                "intense gym music"
        ));

        musicMap.put("stressed", List.of(
                "lofi beats relax",
                "deep focus music",
                "calm piano music"
        ));

        musicMap.put("calm", List.of(
                "meditation music",
                "relaxing instrumental",
                "peaceful flute music"
        ));

        musicMap.put("energetic", List.of(
                "gym motivation songs",
                "edm workout playlist",
                "high energy music"
        ));

        musicMap.put("neutral", List.of(
                "trending songs india",
                "indie songs playlist",
                "top hits playlist"
        ));

        musicMap.put("fearful", List.of(
                "calm music for anxiety",
                "soothing instrumental",
                "healing music"
        ));

        musicMap.put("surprised", List.of(
                "upbeat electronic music",
                "trending viral songs",
                "dance hits"
        ));

        musicMap.put("disgusted", List.of(
                "comedy songs",
                "funny music videos",
                "light mood songs"
        ));

        List<String> queries = musicMap.get(mood);

        if (queries == null) {
            log.warn("⚠️ Unknown mood: {} → fallback", mood);
            queries = List.of("top hits playlist");
        }

        List<RecItem> result = queries.stream()
                .limit(limit)
                .map(q -> RecItem.builder()
                        .externalId("yt-" + q.replace(" ", "-"))
                        .title(q)
                        .reason("Click to play on YouTube")
                        .score(BigDecimal.valueOf(0.7))
                        .build())
                .toList();

        log.info("🎵 Music: {}", result.stream().map(RecItem::getTitle).toList());

        return result;
    }

    // ───────── 🔥 FIXED ACTIVITIES (ALL MOODS) ─────────
    public List<RecItem> fetchActivities(String mood, int limit) {

        mood = mood.toLowerCase().trim();

        Map<String, List<RecItem>> map = new HashMap<>();

        map.put("happy", List.of(
                act("Cafe near you", "Enjoy something nice"),
                act("Call a friend", "Share your happiness")
        ));

        map.put("sad", List.of(
                act("Park walk", "Fresh air helps"),
                act("Journaling", "Write your thoughts")
        ));

        map.put("angry", List.of(
                act("Gym workout", "Release anger"),
                act("Boxing", "Channel energy")
        ));

        map.put("stressed", List.of(
                act("Meditation", "Relax your mind"),
                act("Yoga class", "Reduce stress")
        ));

        map.put("calm", List.of(
                act("Reading", "Stay peaceful"),
                act("Sketching", "Be creative")
        ));

        map.put("energetic", List.of(
                act("Running", "Use your energy"),
                act("Sports", "Stay active")
        ));

        map.put("neutral", List.of(
                act("Walk outside", "Clear your head"),
                act("Watch something light", "Relax your mind")
        ));

        map.put("fearful", List.of(
                act("Deep breathing", "Calm yourself"),
                act("Talk to someone", "Feel safe")
        ));

        map.put("surprised", List.of(
                act("Try something new", "Explore"),
                act("Go out", "Experience something")
        ));

        map.put("disgusted", List.of(
                act("Take a break", "Reset yourself"),
                act("Clean your space", "Refresh your mind")
        ));

        if (!map.containsKey(mood)) {
            log.warn("⚠️ Unknown mood: {} → fallback", mood);
        }

        List<RecItem> result = map.getOrDefault(mood, map.get("calm"));

        log.info("🏃 Activities: {}", result.stream().map(RecItem::getTitle).toList());

        return result.stream().limit(limit).toList();
    }

    private RecItem act(String title, String reason) {
        return RecItem.builder()
                .externalId("act-" + title.replace(" ", "-").toLowerCase())
                .title(title)
                .imageUrl(getActivityImage(title))
                .reason(reason)
                .score(BigDecimal.valueOf(0.8))
                .build();
    }

    private String getActivityImage(String title) {
        return "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=500";
    }
}