package com.okgip.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "badges")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String title;

    private String icon;
    
    @Column(length = 1000)
    private String description;

    private String category;
}
