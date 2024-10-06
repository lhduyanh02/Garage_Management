package com.lhduyanh.garagemanagement.repository;

import com.lhduyanh.garagemanagement.entity.Price;
import com.lhduyanh.garagemanagement.entity.PriceId;
import com.lhduyanh.garagemanagement.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PriceRepository extends JpaRepository<Price, PriceId> {

    Optional<Price> findByService(Service service);

}
