package com.moodrec.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.UUID;

@Data
public class FeedbackRequest {
    @NotNull(message = "Recommendation ID is required")
    private UUID recommendationId;

    @NotBlank
    @Pattern(regexp = "LIKE|DISLIKE", message = "Reaction must be LIKE or DISLIKE")
    private String reaction;
}
