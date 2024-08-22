package com.lhduyanh.garagemanagement.repository;

import com.lhduyanh.garagemanagement.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, String> {

    @Query("SELECT r FROM Role r WHERE r.roleKey = :roleKey")
    Optional<Role> findByRoleKey(@Param("roleKey") String roleKey);

}
