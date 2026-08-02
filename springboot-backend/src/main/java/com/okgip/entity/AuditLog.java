package com.okgip.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_email")
    private String userEmail;

    private String action;
    private String resource;

    @Column(length = 2000)
    private String details;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
