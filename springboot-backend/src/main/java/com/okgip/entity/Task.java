package com.okgip.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @ManyToOne
    @JoinColumn(name = "assigned_to", nullable = false)
    private Employee assignedTo;

    @ManyToOne
    @JoinColumn(name = "assigned_by", nullable = false)
    private Employee assignedBy;

    private String priority = "MEDIUM"; // HIGH, MEDIUM, LOW
    private String status = "PENDING"; // PENDING, WORKING, COMPLETED, LATE

    private LocalDate deadline;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
