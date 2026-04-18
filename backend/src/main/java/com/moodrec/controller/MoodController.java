package com.moodrec.controller;

import com.moodrec.dto.request.TextAnalysisRequest;
import com.moodrec.dto.response.MoodResponse;
import com.moodrec.service.MoodService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/mood")
@RequiredArgsConstructor
public class MoodController {

    private final MoodService moodService;

    @PostMapping("/analyze-text")
    public ResponseEntity<MoodResponse> analyzeText(
            @Valid @RequestBody TextAnalysisRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(moodService.analyzeText(request, user.getUsername()));
    }

    @PostMapping(value = "/detect-face", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MoodResponse> detectFace(
            @RequestParam("image") MultipartFile image,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(moodService.detectFace(image, user.getUsername()));
    }

    @PostMapping(value = "/analyze-combined", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MoodResponse> analyzeCombined(
            @RequestParam("image") MultipartFile image,
            @RequestParam("text") String text,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(moodService.analyzeCombined(image, text, user.getUsername()));
    }
}
