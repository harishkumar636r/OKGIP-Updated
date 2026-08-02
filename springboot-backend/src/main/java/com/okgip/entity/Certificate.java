package com.okgip.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "certificates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "certificate_number", nullable = false, unique = true)
    private String certificateNumber;

    @Column(nullable = false)
    private String title;

    private String provider;
    private LocalDate issueDate;
    
    @Column(name = "certificate_url", length = 2000)
    private String certificateUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
