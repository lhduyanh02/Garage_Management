package com.lhduyanh.garagemanagement.repository;

import com.lhduyanh.garagemanagement.entity.Account;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {
    @Query("SELECT COUNT(a) > 0 FROM Account a WHERE a.user.email = :email")
    boolean existsByEmail(@Param("email") String email);
}
