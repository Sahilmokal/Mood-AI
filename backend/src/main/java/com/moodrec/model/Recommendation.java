package com.moodrec.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "recommendations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "mood_history_id", nullable = false)
    private MoodHistory moodHistory;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecommendationType type;

    @Column(name = "external_id")
    private String externalId;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(precision = 5, scale = 4)
    private BigDecimal score = BigDecimal.ZERO;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();
}
