package com.moodrec.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "mood_history")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MoodHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String mood;

    @Column(nullable = false, precision = 4, scale = 3)
    private BigDecimal confidence;

    @Column(name = "text_input")
    private String textInput;

    @Column(name = "image_url")
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MoodSource source;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @OneToMany(mappedBy = "moodHistory", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Recommendation> recommendations = new ArrayList<>();
}
