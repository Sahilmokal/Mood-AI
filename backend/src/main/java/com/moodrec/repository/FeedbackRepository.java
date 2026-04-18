package com.moodrec.repository;

import com.moodrec.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, UUID> {

    Optional<Feedback> findByUserIdAndRecommendationId(UUID userId, UUID recommendationId);

    @Query("SELECT f FROM Feedback f WHERE f.user.id = :userId AND f.reaction = 'LIKE' ORDER BY f.createdAt DESC")
    List<Feedback> findLikedByUserId(UUID userId);

    boolean existsByUserIdAndRecommendationId(UUID userId, UUID recommendationId);
}
