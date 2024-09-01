package com.lhduyanh.garagemanagement.repository;

import com.lhduyanh.garagemanagement.entity.Permissions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permissions, String> {

    Optional<Permissions> findByPermissionKey(String permissionKey);

    boolean existsByPermissionKey(String permissionKey);
}
