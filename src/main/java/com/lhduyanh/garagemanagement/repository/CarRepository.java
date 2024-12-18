package com.lhduyanh.garagemanagement.repository;

import com.lhduyanh.garagemanagement.entity.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CarRepository extends JpaRepository<Car, String> {

    List<Car> findByNumPlateAndPlateTypeId(String numPlate, int plateTypeId);

    List<Car> findAllByStatus(int status);

    @Query("SELECT c FROM Car c " +
            "WHERE (:partialNumPlate IS NULL OR UPPER(c.numPlate) LIKE CONCAT('%', UPPER(:partialNumPlate), '%')) " +
            "AND (:plateTypeId IS NULL OR c.plateType.id = :plateTypeId) " +
            "AND (:brandId IS NULL OR c.model.brand.id = :brandId) " +
            "AND (:modelId IS NULL OR c.model.id = :modelId)")
    List<Car> searchCars(@Param("partialNumPlate") String partialNumPlate,
                         @Param("plateTypeId") Integer plateTypeId,
                         @Param("brandId") Integer brandId,
                         @Param("modelId") Integer modelId);

    @Query("""
        SELECT c FROM Car c
        JOIN c.users u 
        WHERE u.id = :id
    """)
    List<Car> findAllByManager(@Param("id") String managerId);

    // Count number of car
    @Query("SELECT COUNT(c) FROM Car c WHERE c.status <> 0-1")
    Long countAllCar();

}
