package com.okgip.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private Employee sender;

    @ManyToOne
    @JoinColumn(name = "recipient_id")
    private Employee recipient; // Null for announcements

    @Column(name = "is_announcement")
    private Boolean isAnnouncement = false;

    @Column(length = 4000, nullable = false)
    private String content;

    @Column(name = "attachment_url", length = 2000)
    private String attachmentUrl;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
