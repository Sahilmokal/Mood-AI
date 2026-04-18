package com.moodrec.repository;

import com.moodrec.model.Recommendation;
import com.moodrec.model.RecommendationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, UUID> {

    List<Recommendation> findByMoodHistoryIdOrderByScoreDesc(UUID moodHistoryId);

    @Query("SELECT r FROM Recommendation r WHERE r.user.id = :userId ORDER BY r.createdAt DESC")
    List<Recommendation> findTop20ByUserIdOrderByCreatedAtDesc(UUID userId);

    @Query("""
        SELECT r.externalId, COUNT(f) as likes FROM Recommendation r
        JOIN Feedback f ON f.recommendation.id = r.id
        WHERE r.type = :type AND f.reaction = 'LIKE'
        GROUP BY r.externalId
        ORDER BY likes DESC
        """)
    List<Object[]> findPopularExternalIdsByType(RecommendationType type);
}
