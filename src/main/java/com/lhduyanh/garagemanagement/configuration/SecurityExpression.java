package com.lhduyanh.garagemanagement.configuration;

import com.lhduyanh.garagemanagement.entity.Role;
import com.lhduyanh.garagemanagement.repository.RoleRepository;
import com.lhduyanh.garagemanagement.service.PermissionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.List;

@Component("securityExpression")
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class SecurityExpression { // Định nghĩa phương thức dùng cho xác thực phân quyền
    RoleRepository roleRepository;

    public boolean hasPermission(List<String> permissionKeys) {
        // Lấy role từ userId được lưu trong SecurityContextHolder
        var auth = SecurityContextHolder.getContext().getAuthentication();

        Jwt jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        var id = jwt.getClaimAsString("UUID");
        var roleIds = roleRepository.findRolesByUserId(id).stream().map(Role::getId).toList();
        roleIds.forEach(roleId -> log.info("Role: " + roleId));

        // Kiểm tra nếu role có permission tương ứng
        return roleIds != null && roleRepository.existByRoleIdsAndPermissionKeys(roleIds, permissionKeys);
    }
}
