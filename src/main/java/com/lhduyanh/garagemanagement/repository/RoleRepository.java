package com.lhduyanh.garagemanagement.repository;

import com.lhduyanh.garagemanagement.entity.Role;
import lombok.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, String> {

    @Override
    @NonNull
    @Query("SELECT r FROM Role r LEFT JOIN FETCH r.permissions")
    List<Role> findAll();

    @Query("SELECT r FROM Role r LEFT JOIN FETCH r.permissions WHERE r.id = :id")
    Optional<Role> findByIdFetchPermissions(@Param("id") String id);

    List<Role> findAllByStatus(int status);

    @Query("SELECT r FROM Role r WHERE r.roleKey = :roleKey")
    Optional<Role> findByRoleKey(@Param("roleKey") String roleKey);

    Optional<Role> findByRoleName(String roleName);

    @Query(value = """
                    SELECT IF (COUNT(rp.role_id) > 0, 'true', 'false')
                    FROM role_permission rp 
                    JOIN permissions p on rp.permission_id = p.id
                    WHERE rp.role_id IN :roleIds
                    AND p.permission_key IN :permissionKeys
                        """, nativeQuery = true)
    Boolean existByRoleIdsAndPermissionKeys(@Param("roleIds") List<String> roleIds,
                                            @Param("permissionKeys") List<String> permissionKeys);

    @Query(value = """
                SELECT r.id, r.role_key, r.role_name, r.status
                FROM (SELECT * FROM role WHERE status = 1) r
                JOIN user_role ur on r.id = ur.role_id JOIN User u on u.id = ur.user_id
                WHERE user_id = :userId
                """, nativeQuery = true)
    List<Role> findRolesByUserId(@Param("userId") String userId);
}
