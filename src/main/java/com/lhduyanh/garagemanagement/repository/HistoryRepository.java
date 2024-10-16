package com.lhduyanh.garagemanagement.repository;

import com.lhduyanh.garagemanagement.entity.History;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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

}
