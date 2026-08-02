package com.okgip.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "employees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    private String designation;

    private Integer experienceYears;

    @Column(length = 2000)
    private String avatarUrl;

    @Column(name = "performance_score")
    private Double performanceScore = 0.0;

    @Column(name = "casual_leave_balance")
    private Integer casualLeaveBalance = 12;

    @Column(name = "medical_leave_balance")
    private Integer medicalLeaveBalance = 10;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
