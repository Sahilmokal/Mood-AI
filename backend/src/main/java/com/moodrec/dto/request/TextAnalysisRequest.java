package com.moodrec.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TextAnalysisRequest {
    @NotBlank(message = "Text cannot be blank")
    @Size(min = 3, max = 2000, message = "Text must be between 3 and 2000 characters")
    private String text;
}
