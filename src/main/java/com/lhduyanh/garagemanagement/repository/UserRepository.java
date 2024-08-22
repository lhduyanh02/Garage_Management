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

//    Optional<User> findByEmail(String email);

//    @Query("SELECT u FROM User u WHERE u.email = :email")
//    Optional<User> findByEmailStatus1(@Param("email") String email);

//    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u JOIN FETCH u.address")
    List<User> findAllWithAddress();
}

