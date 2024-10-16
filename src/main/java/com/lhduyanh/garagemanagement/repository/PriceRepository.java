package com.lhduyanh.garagemanagement.repository;

import com.lhduyanh.garagemanagement.entity.Options;
import com.lhduyanh.garagemanagement.entity.Price;
import com.lhduyanh.garagemanagement.entity.PriceId;
import com.lhduyanh.garagemanagement.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PriceRepository extends JpaRepository<Price, PriceId> {

    List<Price> findAllByService(Service service);

    List<Price> findAllByOptions(Options option);

    Optional<Price> findById(PriceId id);
}
