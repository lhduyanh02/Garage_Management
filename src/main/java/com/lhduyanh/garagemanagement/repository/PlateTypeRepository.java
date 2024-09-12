package com.lhduyanh.garagemanagement.repository;

import com.lhduyanh.garagemanagement.entity.PlateType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlateTypeRepository extends JpaRepository<PlateType, Integer> {

    boolean existsByType(String type);

    List<PlateType> findAllByStatus(int status);

}