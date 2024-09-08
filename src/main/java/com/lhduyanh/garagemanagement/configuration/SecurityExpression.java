package com.lhduyanh.garagemanagement.configuration;

import com.lhduyanh.garagemanagement.entity.Role;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.repository.RoleRepository;
import com.lhduyanh.garagemanagement.repository.UserRepository;
import com.lhduyanh.garagemanagement.service.PermissionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

import static java.util.Objects.isNull;

@Component("securityExpression")
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class SecurityExpression { // Định nghĩa phương thức dùng cho xác thực phân quyền

    RoleRepository roleRepository;
    private final UserRepository userRepository;

    public boolean hasPermission(List<String> permissionKeys) {
        var id = getUUIDFromJwt();
        var user = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if(user.getStatus() == 9999)
            return true;

        if (user.getStatus() != 1)
            return false;

        var roleIds = user.getRoles()
                .stream()
                .map(Role::getId)
                .toList();

        log.info("---LOG ROLE FROM SECURITY METHOD---");
        roleIds.forEach(roleId -> log.info("Role: " + roleId));

        // Kiểm tra nếu role có permission tương ứng
        return roleRepository.existByRoleIdsAndPermissionKeys(roleIds, permissionKeys);

    }

    public static String getUUIDFromJwt() { // Hàm lấy UUID từ security context holder
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (isNull(auth)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        var jwt = (Jwt) auth.getPrincipal();
        return jwt.getClaimAsString("UUID");
    }
}
