package com.moodrec.service;

import com.moodrec.dto.request.FeedbackRequest;
import com.moodrec.exception.ResourceNotFoundException;
import com.moodrec.model.Feedback;
import com.moodrec.model.Recommendation;
import com.moodrec.model.User;
import com.moodrec.repository.FeedbackRepository;
import com.moodrec.repository.RecommendationRepository;
import com.moodrec.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final RecommendationRepository recommendationRepository;
    private final UserRepository userRepository;

    @Transactional
    public void submitFeedback(FeedbackRequest request, String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Recommendation rec = recommendationRepository.findById(request.getRecommendationId())
                .orElseThrow(() -> new ResourceNotFoundException("Recommendation not found"));

        Feedback.Reaction reaction = Feedback.Reaction.valueOf(request.getReaction());

        // Upsert: update if exists, create if not
        feedbackRepository.findByUserIdAndRecommendationId(user.getId(), rec.getId())
                .ifPresentOrElse(
                        existing -> {
                            existing.setReaction(reaction);
                            feedbackRepository.save(existing);
                            log.info("Feedback updated: {} for rec={}", reaction, rec.getId());
                        },
                        () -> {
                            feedbackRepository.save(Feedback.builder()
                                    .user(user).recommendation(rec).reaction(reaction).build());
                            log.info("Feedback created: {} for rec={}", reaction, rec.getId());
                        });
    }
}
