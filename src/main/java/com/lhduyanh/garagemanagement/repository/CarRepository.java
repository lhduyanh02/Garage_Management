package com.lhduyanh.garagemanagement.repository;

import com.lhduyanh.garagemanagement.entity.Car;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CarRepository extends JpaRepository<Car, String> {

    boolean existsByNumPlate(String numPlate);

    boolean existsByNumPlateAndPlateTypeIdAndStatus(String numPlate, int plateTypeId, int status);

    List<Car> findByNumPlateAndPlateTypeId(String numPlate, int plateTypeId);

    List<Car> findAllByStatus(int status);

}
