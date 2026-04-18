package com.moodrec.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserHistoryResponse {
    private List<MoodEntry> moodHistory;
    private Map<String, Long> moodCounts;
    private long totalSessions;
    private int page;
    private int size;
    private long totalElements;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class MoodEntry {
        private UUID id;
        private String mood;
        private BigDecimal confidence;
        private String source;
        private Instant createdAt;
    }
}
