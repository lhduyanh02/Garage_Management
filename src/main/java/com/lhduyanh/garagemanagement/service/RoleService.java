package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.configuration.CollatorConfig;
import com.lhduyanh.garagemanagement.dto.request.RoleCreationRequest;
import com.lhduyanh.garagemanagement.dto.request.RoleUpdateRequest;
import com.lhduyanh.garagemanagement.dto.response.PermissionResponse;
import com.lhduyanh.garagemanagement.dto.response.RoleResponse;
import com.lhduyanh.garagemanagement.dto.response.RoleSimpleResponse;
import com.lhduyanh.garagemanagement.entity.Permissions;
import com.lhduyanh.garagemanagement.entity.Role;
import com.lhduyanh.garagemanagement.enums.RoleStatus;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.mapper.RoleMapper;
import com.lhduyanh.garagemanagement.repository.PermissionRepository;
import com.lhduyanh.garagemanagement.repository.RoleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.text.Collator;
import java.util.*;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RoleService {

    RoleMapper roleMapper;
    RoleRepository roleRepository;
    PermissionRepository permissionRepository;
    Collator vietnameseCollator;

    public List<RoleResponse> getAllRole(){
        return roleRepository.findAll().stream()
                .map(role -> {
                    RoleResponse roleResponse = roleMapper.toRoleResponse(role);
                    List<PermissionResponse> permissions = roleResponse.getPermissions()
                            .stream()
                            .sorted(Comparator.comparing(PermissionResponse::getName, vietnameseCollator))
                            .toList();
                    roleResponse.setPermissions(permissions);
                    return roleResponse;
                })
                .sorted(Comparator.comparing(RoleResponse::getRoleName, vietnameseCollator))
                .toList();
    }

    public RoleResponse getRoleById(String id) {
        return roleRepository.findByIdFetchPermissions(id)
                .map(role -> roleMapper.toRoleResponse(role))
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));
    }

    public List<RoleSimpleResponse> getAllEnableRole(){
        return roleRepository.findAllByStatus(RoleStatus.USING.getCode())
                .stream()
                .map(roleMapper::toRoleSimpleResponse)
                .sorted(Comparator.comparing(RoleSimpleResponse::getRoleName, vietnameseCollator))
                .toList();
    }

    public RoleResponse addRole(RoleCreationRequest request){
        request.setRoleName(request.getRoleName().trim());
        request.setRoleKey(request.getRoleKey().trim());

        roleRepository.findByRoleKey(request.getRoleKey())
                .ifPresent(role -> {
                    throw new AppException(ErrorCode.ROLEKEY_EXISTED);
                });


        roleRepository.findByRoleName(request.getRoleName())
                .ifPresent(role -> {
                    throw new AppException(ErrorCode.ROLENAME_EXISTED);
                });

        Role role = roleMapper.toRole(request);

        if(!request.getPermissions().isEmpty()){
            List<Permissions> permissions = permissionRepository.findAllById(request.getPermissions());
            role.setPermissions(new HashSet<>(permissions));
        } else {
            throw new AppException(ErrorCode.EMPTY_PERMISSION_LIST);
        }

        return roleMapper.toRoleResponse(roleRepository.save(role));
    }

    public void deleteRole(String request){
        Optional<Role> r = roleRepository.findById(request);
        if(r.isEmpty()){
            throw new AppException(ErrorCode.ROLE_NOT_EXISTED);
        }

        roleRepository.deleteById(request);
    }

    public RoleResponse updateRole(String id, RoleUpdateRequest request) {
        Role role = roleRepository.findByIdFetchPermissions(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));

        // Cấm edit các roles cơ bản
//        List<String> notEditRoles = List.of("ADMIN", "KTV", "CUSTOMER", "CVDV");
//
//        if (notEditRoles.contains(request.getRoleKey())) {
//            throw new AppException(ErrorCode.ROLE_CAN_NOT_EDIT);
//        }

        request.setRoleName(request.getRoleName().trim());
        request.setRoleKey(request.getRoleKey().trim());

        roleRepository.findByRoleName(role.getRoleName())
                .filter(r -> !r.getId().equals(id))
                .ifPresent(r -> {
                    throw new AppException(ErrorCode.ROLENAME_EXISTED);
                });

        roleRepository.findByRoleKey(role.getRoleKey())
                .filter(r -> !r.getId().equals(id))
                .ifPresent(r -> {
                    throw new AppException(ErrorCode.ROLEKEY_EXISTED);
                });

        role.setRoleName(request.getRoleName());
        role.setRoleKey(request.getRoleKey());
        role.setStatus(request.getStatus());

        if (request.getPermissions().isEmpty()) {
            throw new AppException(ErrorCode.EMPTY_PERMISSION_LIST);
        }

        Set<Permissions> permissionList = new HashSet<>();

        for (String p : request.getPermissions()) {
            Permissions permission = permissionRepository.findById(p)
                    .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_EXISTED));
            permissionList.add(permission);
        }

        role.setPermissions(permissionList);
        return roleMapper.toRoleResponse(roleRepository.save(role));
    }

    public Boolean enableRoleById (String id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));

        // Cấm edit các roles cơ bản
        List<String> notEditRoles = List.of("ADMIN", "KTV", "CUSTOMER", "CVDV");

        if (notEditRoles.contains(role.getRoleKey())) {
            throw new AppException(ErrorCode.ROLE_CAN_NOT_EDIT);
        }

        role.setStatus(1);
        roleRepository.save(role);
        return true;
    }

    public Boolean disableRoleById (String id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));

        // Cấm edit các roles cơ bản
        List<String> notEditRoles = List.of("ADMIN", "KTV", "CUSTOMER", "CVDV");

        if (notEditRoles.contains(role.getRoleKey())) {
            throw new AppException(ErrorCode.ROLE_CAN_NOT_EDIT);
        }

        role.setStatus(0);
        roleRepository.save(role);
        return true;
    }
}

