package com.lhduyanh.garagemanagement.repository;

import com.lhduyanh.garagemanagement.entity.PostServiceImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostServiceImageRepository extends JpaRepository<PostServiceImage, String> {

    List<PostServiceImage> findAllByHistoryId(String historyId);

}
