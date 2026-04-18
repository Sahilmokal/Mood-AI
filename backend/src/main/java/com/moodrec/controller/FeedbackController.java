package com.moodrec.controller;

import com.moodrec.dto.request.FeedbackRequest;
import com.moodrec.dto.response.ErrorResponse;
import com.moodrec.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> submitFeedback(
            @Valid @RequestBody FeedbackRequest request,
            @AuthenticationPrincipal UserDetails user) {
        feedbackService.submitFeedback(request, user.getUsername());
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Feedback recorded",
                "timestamp", Instant.now().toString()));
    }
}
