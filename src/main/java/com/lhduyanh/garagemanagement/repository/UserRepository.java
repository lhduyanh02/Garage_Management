package com.lhduyanh.garagemanagement.repository;

import com.lhduyanh.garagemanagement.entity.User;
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

//    @Query("SELECT u FROM User u WHERE u.email = :email")
//    Optional<User> findByEmailStatus1(@Param("email") String email);

//    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.address")
    List<User> findAllWithAddress();

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.address WHERE u.id = :id")
    Optional<User> findById(@Param("id") String id);

    Optional<User> findByStatus(int status);
}
