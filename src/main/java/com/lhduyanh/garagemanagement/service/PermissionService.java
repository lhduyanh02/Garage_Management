package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.request.PermissionRequest;
import com.lhduyanh.garagemanagement.dto.response.PermissionResponse;
import com.lhduyanh.garagemanagement.entity.Functions;
import com.lhduyanh.garagemanagement.entity.Permissions;
import com.lhduyanh.garagemanagement.entity.Role;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.mapper.PermissionMapper;
import com.lhduyanh.garagemanagement.repository.FunctionRepository;
import com.lhduyanh.garagemanagement.repository.PermissionRepository;
import com.lhduyanh.garagemanagement.repository.RoleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PermissionService {

    PermissionRepository permissionRepository;
    PermissionMapper permissionMapper;
    FunctionRepository functionRepository;
    private final RoleRepository roleRepository;

    public PermissionResponse addPermission(PermissionRequest request) {

        if(permissionRepository.existsByPermissionKey(request.getPermissionKey())) {
            throw new AppException(ErrorCode.PERMISSIONKEY_EXISTED);
        }

        Permissions permissions = permissionMapper.toPermissions(request);

        Functions functions = functionRepository.findById(request.getFunctionId())
                .orElseThrow(() -> new AppException(ErrorCode.FUNCTION_NOT_EXISTED));

        permissions.setFunction(functions);

        return permissionMapper.toPermissionResponse(permissionRepository.save(permissions));
    }

    public List<PermissionResponse> getAllPermissions() {
        var permissions = permissionRepository.findAll();

        return permissions.stream().map(permissionMapper::toPermissionResponse).toList();
    }

    public void deletePermission(String permissionId) {
        var permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_EXISTED));

        var roles = permission.getRoles(); // Lấy danh sách roles tham chiếu tới permission
        for(Role r : roles) { // Duyệt qua từng role và gỡ permission đó
            r.getPermissions().remove(permission);
        }
        roleRepository.saveAll(roles); // Lưu danh sách roles vừa chỉnh sửa lại

        permissionRepository.deleteById(permissionId);
    }


}
