package com.lhduyanh.garagemanagement.repository;

import com.lhduyanh.garagemanagement.entity.InvalidatedToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvalidatedTokenRepository extends JpaRepository<InvalidatedToken, String> {
}
