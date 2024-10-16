package com.lhduyanh.garagemanagement.repository;

import com.lhduyanh.garagemanagement.entity.DetailHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DetailHistoryRepository extends JpaRepository<DetailHistory, String> {
}
