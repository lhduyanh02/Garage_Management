package com.lhduyanh.garagemanagement.repository;

import com.lhduyanh.garagemanagement.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Integer> {
    public boolean existsByBrand(String brand);

    @Query("SELECT b FROM Brand b JOIN FETCH b.models")
    public List<Brand> findAllBrandModel();
}
