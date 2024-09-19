package com.lhduyanh.garagemanagement.repository;

import com.lhduyanh.garagemanagement.entity.Brand;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Integer> {

    boolean existsByBrand(String brand);

    @Query("SELECT b FROM Brand b JOIN FETCH b.models")
    List<Brand> findAllBrandModel();

    @Query("SELECT b FROM Brand b JOIN FETCH b.models WHERE b.id = :id")
    Optional<Brand> findByIdAndFetchModels(@Param("id") int id);

}
