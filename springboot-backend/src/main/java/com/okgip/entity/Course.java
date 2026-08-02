package com.okgip.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @ManyToOne
    @JoinColumn(name = "target_skill_id")
    private Skill targetSkill;

    private String category;
    private Integer durationHours;
    private String provider; // Coursera, Udemy, Internal, etc.
    private String level; // Beginner, Intermediate, Advanced

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
