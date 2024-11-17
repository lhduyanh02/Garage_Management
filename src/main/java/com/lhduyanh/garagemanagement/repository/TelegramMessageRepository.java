package com.lhduyanh.garagemanagement.repository;

import com.lhduyanh.garagemanagement.entity.TelegramMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TelegramMessageRepository extends JpaRepository<TelegramMessage, String> {

    @Query("SELECT t FROM TelegramMessage t WHERE t.sender.id = :sender")
    List<TelegramMessage> findAllBySender(@Param("sender") String sender);

    @Query("""
            SELECT t FROM TelegramMessage t
            WHERE (:status IS NULL OR t.status = :status) AND t.status <> 0-1
            """)
    List<TelegramMessage> findAllByStatus(@Param("status") Integer status);

    @Query("""
            SELECT COUNT(r) FROM TelegramMessage t
            JOIN t.receivers r
            WHERE t.id = :id
            """)
    Integer countReceiverByTelegramMessageId(@Param("id") String id);

    @Query("""
            SELECT t FROM TelegramMessage t
            LEFT JOIN FETCH t.receivers r
            LEFT JOIN FETCH r.address
            WHERE t.id = :id
            """)
    Optional<TelegramMessage> findByIdFetchReceivers(@Param("id") String id);

}
