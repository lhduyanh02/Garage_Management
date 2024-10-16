package com.lhduyanh.garagemanagement.repository;

import com.lhduyanh.garagemanagement.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    @Query("SELECT u FROM User u JOIN u.accounts a WHERE a.email = :email")
    Optional<User> findByEmail(@Param("email") String email);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.address LEFT JOIN FETCH u.accounts")
    List<User> findAllWithAccounts();

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.address")
    List<User> findAllWithAddress();

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.address LEFT JOIN FETCH u.roles " +
            "LEFT JOIN FETCH u.cars r")
    List<User> findAllUserFullInfo();

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.address LEFT JOIN FETCH u.roles " +
            "LEFT JOIN FETCH u.cars r WHERE u.id = :id")
    Optional<User> findByIdFullInfo(@Param("id") String id);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.address LEFT JOIN FETCH u.cars LEFT JOIN FETCH u.roles r WHERE u.status = 1 AND r.status = 1")
    List<User> findAllActiveUserFetchCars();

    @Query("""
            SELECT u FROM User u 
            LEFT JOIN FETCH u.accounts a
            LEFT JOIN FETCH u.address 
            LEFT JOIN FETCH u.roles r
            LEFT JOIN FETCH u.cars c
            WHERE u.status = 1 AND "CUSTOMER" IN (SELECT rr.roleKey FROM u.roles rr)
            """)
    List<User> findAllActiveCustomerFullInfo();

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.address LEFT JOIN FETCH u.cars WHERE u.id = :id")
    Optional<User> findById(@Param("id") String id);

    Optional<User> findByStatus(int status);
}

