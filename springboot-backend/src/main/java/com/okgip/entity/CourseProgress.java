package com.okgip.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "course_progress")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "completion_percentage")
    private Integer completionPercentage = 0;

    private String status; // NOT_STARTED, IN_PROGRESS, COMPLETED

    @Column(name = "quiz_score")
    private Integer quizScore;

    @Column(name = "assigned_by")
    private Long assignedBy;

    private LocalDate deadline;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
