package com.lhduyanh.garagemanagement.repository;

import com.lhduyanh.garagemanagement.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {

    @Query("SELECT a FROM Account a JOIN FETCH a.user u LEFT JOIN FETCH u.address WHERE a.id = :id")
    Optional<Account> findByIdFetchAddress(@Param("id") String id);

    @Query("SELECT COUNT(a) > 0 FROM Account a WHERE a.email = :email")
    boolean existsByEmail(@Param("email") String email);

    @Query("SELECT a FROM Account a JOIN FETCH a.user u LEFT JOIN FETCH u.address")
    List<Account> findAll();

    @Query("SELECT a FROM Account a JOIN FETCH a.user u LEFT JOIN FETCH u.address WHERE a.status = :status")
    List<Account> findAllByStatus(@Param("status") int status);

    Optional<Account> findByEmail(String email);

    @Query("SELECT a FROM Account a WHERE a.user.id = :userId")
    Optional<Account> findByUserId(@Param("userId") String userId);

    @Query("SELECT COUNT(a) > 0 FROM Account a WHERE a.email = :email AND a.status = :status")
    boolean existsByEmailAndStatus(@Param("email") String email, @Param("status") int status);

    @Query("SELECT a FROM Account a WHERE a.user.id = :id")
    List<Account> findAllByUserId(@Param("id") String userId);
}
