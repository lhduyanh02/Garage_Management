package com.lhduyanh.garagemanagement.repository;

import com.lhduyanh.garagemanagement.entity.PostServiceImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PostServiceImageRepository extends JpaRepository<PostServiceImage, String> {

    List<PostServiceImage> findAllByHistoryId(String historyId);

    @Query(value = """
            SELECT 
                COUNT(po.id) AS totalImages,
                ROUND(SUM(LENGTH(po.image)) / 1024 / 1024, 2) AS totalBlobSizeMB
            FROM post_service_image po
            WHERE po.upload_time BETWEEN :startDate AND :endDate
            """, nativeQuery = true)
    Object[] getImageStatisticsByDateRange(@Param("startDate") LocalDateTime startDate,
                                           @Param("endDate") LocalDateTime endDate);

    @Modifying
    @Transactional
    void deleteAllByUploadTimeBetween(LocalDateTime startDate, LocalDateTime endDate);
}
