package com.lhduyanh.garagemanagement.repository;

import com.lhduyanh.garagemanagement.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRepository extends JpaRepository<Service, String> {

    boolean existsByName(String name);

    Optional<Service> findByName(String name);

    @Query("SELECT s FROM Service s WHERE s.status = 1")
    List<Service> findAllEnableService();
}
