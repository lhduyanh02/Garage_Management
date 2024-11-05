package com.lhduyanh.garagemanagement.repository;

import com.lhduyanh.garagemanagement.dto.response.UserFullResponse;
import com.lhduyanh.garagemanagement.dto.response.UserSimpleResponse;
import com.lhduyanh.garagemanagement.entity.Options;
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
            "LEFT JOIN FETCH u.cars r LEFT JOIN FETCH u.accounts acc")
    List<User> findAllUserFullInfo();

    @Query("""
            SELECT u
            FROM User u 
            LEFT JOIN FETCH u.address a 
            LEFT JOIN FETCH u.roles r 
            LEFT JOIN FETCH u.cars c 
            LEFT JOIN FETCH u.accounts acc 
            WHERE u.id = :id
                   """)
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

    @Query("""
            SELECT u FROM User u 
            LEFT JOIN FETCH u.accounts a
            LEFT JOIN FETCH u.address 
            LEFT JOIN FETCH u.roles r
            LEFT JOIN FETCH u.cars c
            WHERE 'CUSTOMER' IN (SELECT rr.roleKey FROM u.roles rr)
            AND u.status <> 0-2
            """)
    List<User> findAllCustomerFullInfo();

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.address LEFT JOIN FETCH u.cars WHERE u.id = :id")
    Optional<User> findById(@Param("id") String id);

    Optional<User> findByStatus(int status);

    @Query("SELECT COUNT(u) FROM User u JOIN u.roles r " +
            "WHERE r.roleKey = :roleKey AND u.status = :status")
    long countByRoleKeyAndStatus(@Param("roleKey") String roleKey,
                                 @Param("status") int status);
}

