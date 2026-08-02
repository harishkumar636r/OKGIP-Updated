package com.okgip.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_recommendations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "recommendation_type", nullable = false)
    private String recommendationType; // TRAINING, CAREER, PREDICTIVE_GAP

    @Column(length = 4000, nullable = false)
    private String content;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
