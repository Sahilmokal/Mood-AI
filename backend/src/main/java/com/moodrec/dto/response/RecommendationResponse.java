package com.moodrec.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RecommendationResponse {

    private String mood;
    private BigDecimal confidence;
    private RecommendationGroups recommendations;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RecommendationGroups {
        private List<RecItem> movies;
        private List<RecItem> music;
        private List<RecItem> activities;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RecItem {
        private UUID id;
        private String externalId;
        private String title;
        private String imageUrl;
        private String reason;
        private BigDecimal score;
        private String type;
        private Boolean liked;

        // 🔥 NEW FIELDS
        private String youtubeUrl;
        private String mapUrl;
    }
}