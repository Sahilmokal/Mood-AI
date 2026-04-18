package com.moodrec.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MoodResponse {
    private UUID moodHistoryId;
    private String mood;
    private BigDecimal confidence;
    private String source;
    private Instant createdAt;
}
