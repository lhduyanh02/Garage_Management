package com.lhduyanh.garagemanagement.repository;

import com.lhduyanh.garagemanagement.entity.CommonParameter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommonParameterRepository extends JpaRepository<CommonParameter, String> {

    Optional<CommonParameter> findByKey(String key);

}
