package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.RoleCreationRequest;
import com.lhduyanh.garagemanagement.dto.request.RoleUpdateRequest;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.RoleResponse;
import com.lhduyanh.garagemanagement.dto.response.RoleSimpleResponse;
import com.lhduyanh.garagemanagement.service.RoleService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class RoleController {

    RoleService roleService;

    @PreAuthorize("@securityExpression.hasPermission({'EDIT_ROLE'})")
    @GetMapping("/all")
    public ApiResponse<List<RoleResponse>> getAllRoles() {
        return ApiResponse.<List<RoleResponse>>builder()
                .code(1000)
                .data(roleService.getAllRole())
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'EDIT_ROLE'})")
    @GetMapping("/{id}")
    public ApiResponse<RoleResponse> getRoleById(@PathVariable String id) {
        return ApiResponse.<RoleResponse>builder()
                .code(1000)
                .data(roleService.getRoleById(id))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'EDIT_ROLE', 'GET_ALL_USER', 'SEND_TELEGRAM_MESSAGE'})")
    @GetMapping
    public ApiResponse<List<RoleSimpleResponse>> getAllEnableRoles() {
        return ApiResponse.<List<RoleSimpleResponse>>builder()
                .code(1000)
                .data(roleService.getAllEnableRole())
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'EDIT_ROLE'})")
    @PostMapping
    public ApiResponse<RoleResponse> addRole(@RequestBody @Valid RoleCreationRequest roleCreationRequest) {
        return ApiResponse.<RoleResponse>builder()
                .code(1000)
                .data(roleService.addRole(roleCreationRequest))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'EDIT_ROLE'})")
    @PutMapping("/{id}")
    public ApiResponse<RoleResponse> updateRole(@PathVariable String id,
                                                @RequestBody @Valid RoleUpdateRequest request) {
        return ApiResponse.<RoleResponse>builder()
                .code(1000)
                .data(roleService.updateRole(id, request))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'EDIT_ROLE'})")
    @PutMapping("/enable/{roleId}")
    public ApiResponse<Boolean> enableRole(@PathVariable String roleId) {
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .data(roleService.enableRoleById(roleId))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'EDIT_ROLE'})")
    @PutMapping("/disable/{roleId}")
    public ApiResponse<Boolean> disableRole(@PathVariable String roleId) {
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .data(roleService.disableRoleById(roleId))
                .build();
    }
}
