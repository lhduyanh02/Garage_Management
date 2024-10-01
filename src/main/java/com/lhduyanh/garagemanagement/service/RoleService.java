package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.request.RoleCreationRequest;
import com.lhduyanh.garagemanagement.dto.response.RoleResponse;
import com.lhduyanh.garagemanagement.dto.response.RoleSimpleResponse;
import com.lhduyanh.garagemanagement.entity.Role;
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

import java.util.HashSet;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RoleService {

    RoleMapper roleMapper;
    RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    public List<RoleResponse> getAllRole(){
        return roleRepository.findAll().stream().map(roleMapper::toRoleResponse).toList();
    }

    public List<RoleSimpleResponse> getAllEnableRole(){
        return roleRepository.findAllByStatus(1)
                .stream()
                .map(roleMapper::toRoleSimpleResponse)
                .toList();
    }

    public RoleResponse addRole(RoleCreationRequest request){
        Optional<Role> r = roleRepository.findByRoleKey(request.getRoleKey());
        if(r.isPresent()){
            throw new AppException(ErrorCode.ROLEKEY_EXISTED);
        }

        r = roleRepository.findByRoleName(request.getRoleName());
        if(r.isPresent()){
            throw new AppException(ErrorCode.ROLENAME_EXISTED);
        }

        Role role = roleMapper.toRole(request);

        if(!request.getPermissions().isEmpty()){
            var permissions = permissionRepository.findAllById(request.getPermissions());
            role.setPermissions(new HashSet<>(permissions));

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

}

