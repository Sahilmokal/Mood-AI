package com.moodrec.service;

import com.moodrec.dto.response.MoodResponse;
import com.moodrec.exception.LowConfidenceException;
import com.moodrec.exception.MlServiceException;
import com.moodrec.exception.NoFaceDetectedException;
import com.moodrec.model.MoodHistory;
import com.moodrec.model.MoodSource;
import com.moodrec.model.User;
import com.moodrec.repository.MoodHistoryRepository;
import com.moodrec.repository.UserRepository;
import com.moodrec.dto.request.TextAnalysisRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.Base64;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MoodService {

    @Qualifier("mlWebClient")
    private final WebClient mlClient;
    private final MoodHistoryRepository moodRepo;
    private final UserRepository userRepo;

    private static final double CONFIDENCE_THRESHOLD = 0.45;

    @Transactional
    public MoodResponse analyzeText(TextAnalysisRequest request, String email) {
        MlMoodResult result = callMl("/analyze-text",
                Map.of("text", request.getText()), false);
        return persist(result, MoodSource.TEXT, email, request.getText(), null);
    }

    @Transactional
    public MoodResponse detectFace(MultipartFile image, String email) {
        try {
            String base64 = Base64.getEncoder().encodeToString(image.getBytes());
            MlMoodResult result = callMl("/detect-emotion",
                    Map.of("image_base64", base64), true);
            validateConfidence(result);
            return persist(result, MoodSource.FACE, email, null, null);
        } catch (java.io.IOException e) {
            throw new MlServiceException("Failed to read image file", e);
        }
    }

    @Transactional
    public MoodResponse analyzeCombined(MultipartFile image, String text, String email) {
        try {
            String base64 = Base64.getEncoder().encodeToString(image.getBytes());
            MlMoodResult faceResult = callMl("/detect-emotion",
                    Map.of("image_base64", base64), true);
            MlMoodResult textResult = callMl("/analyze-text",
                    Map.of("text", text), false);
            MlMoodResult combined = fuseResults(faceResult, textResult);
            return persist(combined, MoodSource.COMBINED, email, text, null);
        } catch (java.io.IOException e) {
            throw new MlServiceException("Failed to read image file", e);
        }
    }

    // Weighted fusion: face 60%, text 40%
    private MlMoodResult fuseResults(MlMoodResult face, MlMoodResult text) {
        double faceWeight = 0.6, textWeight = 0.4;
        String mood = face.getConfidence() * faceWeight >= text.getConfidence() * textWeight
                ? face.getMood() : text.getMood();
        double confidence = face.getConfidence() * faceWeight + text.getConfidence() * textWeight;
        return new MlMoodResult(mood, Math.min(confidence, 1.0));
    }

    private MlMoodResult callMl(String uri, Map<String, Object> body, boolean isFace) {
        try {
            return mlClient.post()
                    .uri(uri)
                    .bodyValue(body)
                    .retrieve()
                    .onStatus(s -> s.value() == 422, resp ->
                            Mono.error(new NoFaceDetectedException("No face detected in image")))
                    
                    // ✅ FIXED HERE (no method reference)
                    .onStatus(status -> status.is5xxServerError(), resp ->
                            Mono.error(new MlServiceException("ML service internal error")))
                    
                    .bodyToMono(MlMoodResult.class)
                    .block();

        } catch (WebClientResponseException e) {
            throw new MlServiceException("ML service call failed: " + e.getMessage(), e);
        }
    }

    private void validateConfidence(MlMoodResult result) {
        if (result.getConfidence() < CONFIDENCE_THRESHOLD) {
            throw new LowConfidenceException(
                    String.format("Detection confidence %.0f%% is too low. " +
                            "Please ensure good lighting and face the camera directly.",
                            result.getConfidence() * 100));
        }
    }

    private MoodResponse persist(MlMoodResult result, MoodSource source,
                                String email, String text, String imageUrl) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        MoodHistory entry = MoodHistory.builder()
                .user(user)
                .mood(result.getMood())
                .confidence(BigDecimal.valueOf(result.getConfidence()))
                .source(source)
                .textInput(text)
                .imageUrl(imageUrl)
                .build();

        MoodHistory saved = moodRepo.save(entry);

        log.info("Mood recorded: {} ({}) confidence={} user={}",
                saved.getMood(), source, saved.getConfidence(), email);

        return MoodResponse.builder()
                .moodHistoryId(saved.getId())
                .mood(saved.getMood())
                .confidence(saved.getConfidence())
                .source(source.name())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    // Inner DTO for ML responses
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class MlMoodResult {
        private String mood;
        private double confidence;
    }
}