package com.okgip.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "departments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String code;

    @Column(length = 1000)
    private String description;

    @Column(name = "manager_id")
    private Long managerId;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
