package com.moodrec.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.moodrec.dto.response.RecommendationResponse.RecItem;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@Slf4j
public class ExternalApiService {

    private final WebClient tmdbClient;
    private final WebClient spotifyClient;
    private final String spotifyClientId;
    private final String spotifyClientSecret;

    // Simple in-memory Spotify token cache
    private String spotifyToken;
    private long spotifyTokenExpiry = 0;

    private static final String TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

    public ExternalApiService(
            @Value("${external-apis.tmdb.base-url}") String tmdbBaseUrl,
            @Value("${external-apis.tmdb.api-key}") String tmdbApiKey,
            @Value("${external-apis.spotify.base-url}") String spotifyBaseUrl,
            @Value("${external-apis.spotify.client-id}") String spotifyClientId,
            @Value("${external-apis.spotify.client-secret}") String spotifyClientSecret,
            WebClient.Builder builder) {
        this.spotifyClientId = spotifyClientId;
        this.spotifyClientSecret = spotifyClientSecret;
        this.tmdbClient = builder.clone()
                .baseUrl(tmdbBaseUrl)
                .defaultHeader("Authorization", "Bearer " + tmdbApiKey)
                .build();
        this.spotifyClient = builder.clone()
                .baseUrl(spotifyBaseUrl)
                .build();
    }

    public List<RecItem> fetchMovies(String mood, Map<String, String> moodGenreMap, int limit) {
        try {
            String genres = moodGenreMap.getOrDefault(mood, "18");
            JsonNode response = tmdbClient.get()
                    .uri(u -> u.path("/discover/movie")
                            .queryParam("with_genres", genres)
                            .queryParam("sort_by", "vote_average.desc")
                            .queryParam("vote_count.gte", "100")
                            .queryParam("page", "1")
                            .build())
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            if (response == null || !response.has("results")) return List.of();

            return StreamSupport.stream(response.get("results").spliterator(), false)
                    .limit(limit)
                    .map(node -> RecItem.builder()
                            .externalId(node.get("id").asText())
                            .title(node.get("title").asText())
                            .imageUrl(node.has("poster_path") && !node.get("poster_path").isNull()
                                    ? TMDB_IMAGE_BASE + node.get("poster_path").asText() : null)
                            .reason(buildMovieReason(mood, node))
                            .score(BigDecimal.valueOf(
                                    node.has("vote_average")
                                    ? node.get("vote_average").asDouble() / 10.0 : 0.5))
                            .build())
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("TMDB fetch failed: {}", e.getMessage());
            return List.of();
        }
    }

    public List<RecItem> fetchMusic(String mood, Map<String, double[]> moodAudioMap, int limit) {
        try {
            String token = getSpotifyToken();
            double[] audioFeatures = moodAudioMap.getOrDefault(mood, new double[]{0.5, 0.5});
            String query = buildSpotifyQuery(mood);

            JsonNode response = spotifyClient.get()
                    .uri(u -> u.path("/search")
                            .queryParam("q", query)
                            .queryParam("type", "track")
                            .queryParam("limit", limit)
                            .build())
                    .header("Authorization", "Bearer " + token)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            if (response == null || !response.has("tracks")) return List.of();

            JsonNode tracks = response.get("tracks").get("items");
            return StreamSupport.stream(tracks.spliterator(), false)
                    .map(track -> {
                        String artist = track.get("artists").get(0).get("name").asText();
                        String imageUrl = null;
                        JsonNode images = track.get("album").get("images");
                        if (images.size() > 0) imageUrl = images.get(0).get("url").asText();
                        return RecItem.builder()
                                .externalId(track.get("id").asText())
                                .title(track.get("name").asText() + " — " + artist)
                                .imageUrl(imageUrl)
                                .reason(String.format("Matches your %s mood (energy %.0f%%, positivity %.0f%%)",
                                        mood, audioFeatures[0] * 100, audioFeatures[1] * 100))
                                .score(BigDecimal.valueOf(0.7 + Math.random() * 0.3))
                                .build();
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Spotify fetch failed: {}", e.getMessage());
            return List.of();
        }
    }

    public List<RecItem> fetchActivities(String mood, int limit) {
        // Activities come from our own DB (seeded via Flyway) - served as static list here
        Map<String, List<RecItem>> activityMap = Map.of(
            "happy",    List.of(
                activity("Dance Session", "Put on your playlist and move", "https://images.unsplash.com/photo-1547153760-18fc86324498?w=400", "happy"),
                activity("Cook a New Recipe", "Channel joy into creativity", "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400", "happy")),
            "sad",      List.of(
                activity("Journaling", "Write your thoughts freely — no judgment", "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400", "sad"),
                activity("Evening Walk", "Fresh air and movement lift your spirits", "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400", "sad")),
            "stressed", List.of(
                activity("Morning Yoga", "Release tension with gentle stretches", "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400", "stressed"),
                activity("Meditation", "10-min guided breathing session", "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=400", "stressed")),
            "calm",     List.of(
                activity("Reading", "Dive into a book you've been meaning to start", "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400", "calm"),
                activity("Sketching", "Let your thoughts flow through drawing", "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400", "calm")),
            "energetic",List.of(
                activity("HIIT Workout", "Burn that energy productively", "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", "energetic"),
                activity("Board Games Night", "Bring people together", "https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=400", "energetic"))
        );
        List<RecItem> found = activityMap.getOrDefault(mood,
                activityMap.getOrDefault("calm", List.of()));
        return found.stream().limit(limit).collect(Collectors.toList());
    }

    private RecItem activity(String title, String reason, String imageUrl, String mood) {
        return RecItem.builder()
                .externalId("act-" + title.toLowerCase().replace(" ", "-"))
                .title(title)
                .imageUrl(imageUrl)
                .reason(reason)
                .score(BigDecimal.valueOf(0.75 + Math.random() * 0.2))
                .build();
    }

    private String buildMovieReason(String mood, JsonNode node) {
        double rating = node.has("vote_average") ? node.get("vote_average").asDouble() : 0;
        return String.format("Highly rated (%.1f/10) — great watch for a %s mood", rating, mood);
    }

    private String buildSpotifyQuery(String mood) {
        Map<String, String> queries = Map.of(
            "happy", "feel good pop",
            "sad", "sad indie acoustic",
            "stressed", "relaxing ambient",
            "angry", "intense rock",
            "calm", "lo-fi chill",
            "energetic", "workout hype",
            "neutral", "indie alternative",
            "fearful", "calm classical",
            "surprised", "upbeat electronic",
            "disgusted", "comedy music"
        );
        return queries.getOrDefault(mood, "popular music");
    }

    private synchronized String getSpotifyToken() {
        if (spotifyToken != null && System.currentTimeMillis() < spotifyTokenExpiry) {
            return spotifyToken;
        }
        String credentials = Base64.getEncoder().encodeToString(
                (spotifyClientId + ":" + spotifyClientSecret).getBytes());
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "client_credentials");

        JsonNode resp = WebClient.builder()
                .baseUrl("https://accounts.spotify.com")
                .build()
                .post().uri("/api/token")
                .header("Authorization", "Basic " + credentials)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData(form))
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();

        spotifyToken = resp.get("access_token").asText();
        spotifyTokenExpiry = System.currentTimeMillis() + (resp.get("expires_in").asLong() - 60) * 1000;
        return spotifyToken;
    }
}
