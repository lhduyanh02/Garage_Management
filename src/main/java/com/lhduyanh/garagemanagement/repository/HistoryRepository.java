package com.lhduyanh.garagemanagement.repository;

import com.lhduyanh.garagemanagement.entity.Appointment;
import com.lhduyanh.garagemanagement.entity.History;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface HistoryRepository extends JpaRepository<History, String> {

    @Query("""
        SELECT h FROM History h 
        LEFT JOIN FETCH h.advisor a
        LEFT JOIN FETCH a.address
        LEFT JOIN FETCH h.customer u1
        LEFT JOIN FETCH u1.address 
        WHERE h.id = :id
        """)
    Optional<History> findById(@Param("id") String id);

    @Query("""
        SELECT h FROM History h 
        LEFT JOIN FETCH h.advisor a
        LEFT JOIN FETCH a.address
        LEFT JOIN FETCH h.customer u1
        LEFT JOIN FETCH u1.address 
        LEFT JOIN FETCH h.details
        WHERE h.id = :id
        """)
    Optional<History> findByIdFetchDetails(@Param("id") String id);

    @Query("""
        SELECT h FROM History h 
        LEFT JOIN FETCH h.car c 
        LEFT JOIN FETCH h.advisor a
        LEFT JOIN FETCH a.address
        LEFT JOIN FETCH h.customer u1
        LEFT JOIN FETCH u1.address 
        WHERE c.id = :carId
        """)
    List<History> findAllHistoryByCarId(@Param("carId") String carId);

    @Query("SELECT COUNT(h) FROM History h WHERE h.status > 0")
    Long getHistoryQuantity();

    @Query("""
            SELECT h FROM History h
            LEFT JOIN FETCH h.car c
            LEFT JOIN FETCH h.advisor a
            LEFT JOIN FETCH a.address
            LEFT JOIN FETCH h.customer u1
            LEFT JOIN FETCH u1.address
            WHERE h.serviceDate BETWEEN :start AND :end
            AND (:status IS NULL OR h.status = :status)
            """)
    List<History> getAllHistoryByTimeRange(@Param("start") LocalDateTime start,
                                           @Param("end") LocalDateTime end,
                                           @Param("status") Integer status);

    @Query("""
            SELECT h FROM History h
            LEFT JOIN FETCH h.car c
            LEFT JOIN FETCH h.advisor a
            LEFT JOIN FETCH a.address
            LEFT JOIN FETCH h.customer u1
            LEFT JOIN FETCH u1.address
            WHERE h.status = :status
            """)
    List<History> getAllHistoryByStatus(@Param("status") Integer status);

    @Query("SELECT FUNCTION('DATE', h.serviceDate) AS serviceDay, SUM(h.payableAmount) AS totalRevenue " +
            "FROM History h " +
            "WHERE h.status = 1 AND " +
            "h.serviceDate BETWEEN :start AND :end " +
            "GROUP BY FUNCTION('DATE', h.serviceDate) " +
            "ORDER BY FUNCTION('DATE', h.serviceDate)")
    List<Object[]> findDailyRevenue(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

}
