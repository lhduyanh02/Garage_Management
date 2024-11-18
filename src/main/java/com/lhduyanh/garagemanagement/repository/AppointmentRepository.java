package com.lhduyanh.garagemanagement.repository;

import com.lhduyanh.garagemanagement.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, String> {

    @Query("""
            SELECT a FROM Appointment a 
            JOIN FETCH a.customer c
            LEFT JOIN FETCH a.advisor ad
            LEFT JOIN FETCH c.address 
            LEFT JOIN FETCH ad.address
            WHERE c.id = :id
            """)
    List<Appointment> findAllByCustomerId(@Param("id") String customerId);

    @Query("""
        SELECT a FROM Appointment a
        JOIN FETCH a.customer c
        LEFT JOIN FETCH a.advisor ad
        LEFT JOIN FETCH c.address
        LEFT JOIN FETCH ad.address
        """)
    List<Appointment> findAllFetchData();

    @Query("""
            SELECT a FROM Appointment a 
            JOIN FETCH a.customer c
            LEFT JOIN FETCH a.advisor ad
            LEFT JOIN FETCH c.address 
            LEFT JOIN FETCH ad.address
            WHERE a.id = :id
            """)
    Optional<Appointment> findByIdFetchData(@Param("id") String id);

    @Query("""
        SELECT a FROM Appointment a
        JOIN FETCH a.customer c
        LEFT JOIN FETCH a.advisor ad
        LEFT JOIN FETCH c.address
        LEFT JOIN FETCH ad.address
        WHERE a.time BETWEEN :start AND :end
        """)
    List<Appointment> findAllByTimeRangeFetchData(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("""
        SELECT a FROM Appointment a
        JOIN FETCH a.customer c
        LEFT JOIN FETCH a.advisor ad
        LEFT JOIN FETCH c.address
        LEFT JOIN FETCH ad.address
        WHERE a.createAt BETWEEN :start AND :end
        """)
    List<Appointment> findAllByCreateTimeRangeFetchData(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("""
        SELECT a FROM Appointment a
        JOIN FETCH a.customer c
        LEFT JOIN FETCH a.advisor ad
        LEFT JOIN FETCH c.address
        LEFT JOIN FETCH ad.address
        WHERE a.status = 1
        """)
    List<Appointment> findAllUpcomingAppointments();

}
