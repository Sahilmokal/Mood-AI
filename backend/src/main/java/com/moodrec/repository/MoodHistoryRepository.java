package com.moodrec.repository;

import com.moodrec.model.MoodHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface MoodHistoryRepository extends JpaRepository<MoodHistory, UUID> {

    Page<MoodHistory> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    @Query("SELECT m FROM MoodHistory m WHERE m.user.id = :userId AND m.createdAt >= :since ORDER BY m.createdAt ASC")
    List<MoodHistory> findRecentByUserId(UUID userId, Instant since);

    @Query("SELECT m.mood, COUNT(m) FROM MoodHistory m WHERE m.user.id = :userId GROUP BY m.mood")
    List<Object[]> countByMoodForUser(UUID userId);
}
