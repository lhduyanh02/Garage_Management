package com.lhduyanh.garagemanagement.repository;

import com.lhduyanh.garagemanagement.entity.DetailAppointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetailAppointmentRepository extends JpaRepository<DetailAppointment, String> {

    @Query("SELECT d FROM DetailAppointment d WHERE d.appointmentId = :id")
    List<DetailAppointment> findAllByAppointmentId(@Param("id") String appointmentId);

}
