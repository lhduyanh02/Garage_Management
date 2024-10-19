package com.lhduyanh.garagemanagement.repository;

import com.lhduyanh.garagemanagement.entity.Model;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModelRepository extends JpaRepository<Model, Integer> {

    boolean existsByModel(String model);

    List<Model> findByModel(String model);
}
