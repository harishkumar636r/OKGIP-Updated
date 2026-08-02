package com.okgip.repository;

import com.okgip.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByRecipientIdOrSenderId(Long recipientId, Long senderId);
    List<Message> findByIsAnnouncementTrue();
}
