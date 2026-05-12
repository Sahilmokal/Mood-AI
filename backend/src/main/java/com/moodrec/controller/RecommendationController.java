package com.moodrec.controller;

import com.moodrec.dto.response.RecommendationResponse;
import com.moodrec.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/{id}")
    public ResponseEntity<RecommendationResponse> getRecommendations(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "6") int limit,
            @AuthenticationPrincipal UserDetails user
    ) {
        return ResponseEntity.ok(
                recommendationService.getRecommendations(id, user.getUsername(), limit)
        );
    }
}