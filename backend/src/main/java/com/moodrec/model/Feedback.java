package com.moodrec.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "feedback",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "recommendation_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recommendation_id", nullable = false)
    private Recommendation recommendation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Reaction reaction;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    public enum Reaction { LIKE, DISLIKE }
}
