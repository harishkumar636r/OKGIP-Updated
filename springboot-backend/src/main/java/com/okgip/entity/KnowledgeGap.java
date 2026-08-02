package com.okgip.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "knowledge_gaps")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KnowledgeGap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(name = "current_level")
    private Integer currentLevel; // 1-5 scale

    @Column(name = "required_level")
    private Integer requiredLevel; // 1-5 scale

    private String priority; // HIGH, MEDIUM, LOW

    private String status; // IDENTIFIED, IN_TRAINING, RESOLVED

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
