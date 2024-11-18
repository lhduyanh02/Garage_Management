package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.PermissionRequest;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.PermissionResponse;
import com.lhduyanh.garagemanagement.service.PermissionService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/permissions")
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PermissionController {

    PermissionService permissionService;

    @PreAuthorize("@securityExpression.hasPermission({'EDIT_ROLE'})")
    @GetMapping
    public ApiResponse<List<PermissionResponse>> getAllPermissions() {
        return ApiResponse.<List<PermissionResponse>>builder()
                .code(1000)
                .data(permissionService.getAllPermissions())
                .build();
    }
//
//    @PostMapping
//    public ApiResponse<PermissionResponse> addPermission(@RequestBody @Valid PermissionRequest request) {
//        return ApiResponse.<PermissionResponse>builder()
//                .code(1000)
//                .data(permissionService.addPermission(request))
//                .build();
//    }
//
//    @DeleteMapping("/{id}")
//    public ApiResponse<Void> deletePermission(@PathVariable("id") String id) {
//        permissionService.deletePermission(id);
//        return ApiResponse.<Void>builder()
//                .code(1000)
//                .message("Permission deleted successfully")
//                .build();
//    }

}
