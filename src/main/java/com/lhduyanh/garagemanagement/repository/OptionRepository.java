package com.lhduyanh.garagemanagement.repository;

import com.lhduyanh.garagemanagement.entity.Options;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OptionRepository extends JpaRepository<Options, String> {

    List<Options> findAllByName(String name);

    List<Options> findAllByStatus(int status);
}
