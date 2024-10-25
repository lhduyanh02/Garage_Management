package com.lhduyanh.garagemanagement.repository;

import com.lhduyanh.garagemanagement.entity.PreServiceImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PreServiceImageRepository extends JpaRepository<PreServiceImage, String> {

    List<PreServiceImage> findAllByHistoryId(String historyId);

}
