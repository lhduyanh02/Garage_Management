package com.lhduyanh.garagemanagement.repository;

import com.lhduyanh.garagemanagement.entity.InvalidatedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken, String> {

    @Query("""
        SELECT COUNT(i)
        FROM InvalidatedToken i
        WHERE i.expiryTime BETWEEN :startDate AND :endDate
        """)
    Long countByExpiryTime(@Param("startDate") LocalDateTime startDate,
                           @Param("endDate") LocalDateTime endDate);

    @Modifying
    @Transactional
    void deleteAllByExpiryTimeBetween(LocalDateTime startDate, LocalDateTime endDate);

}
