package com.lhduyanh.garagemanagement.repository;

import com.lhduyanh.garagemanagement.entity.Model;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ModelRepository extends JpaRepository<Model, Integer> {

    public boolean existsByModel(String model);

}
