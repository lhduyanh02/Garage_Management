package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.UserCreationRequest;
import com.lhduyanh.garagemanagement.dto.request.UserDeletionReq;
import com.lhduyanh.garagemanagement.dto.request.UserUpdateRequest;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.UserResponse;
import com.lhduyanh.garagemanagement.entity.User;
import com.lhduyanh.garagemanagement.repository.AddressRepository;
import com.lhduyanh.garagemanagement.repository.RoleRepository;
import com.lhduyanh.garagemanagement.service.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserController {
    UserService userService;
    AddressRepository addressRepository;
    RoleRepository roleRepository;


    @GetMapping
    @PreAuthorize("@securityExpression.hasPermission({'GET_ACCOUNT_LIST', 'GET_USER_LIST'})")
    public ApiResponse<List<UserResponse>> getAllUsers() {
        return ApiResponse.<List<UserResponse>>builder()
                .code(1000)
                .data(userService.getAllUserWithAddress())
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'GET_USER_LIST'})")
    @GetMapping("/getMyInfo")
    public ApiResponse<UserResponse> getMyInfo() {
        return ApiResponse.<UserResponse>builder()
                .code(1000)
                .data(userService.getMyUserInfo())
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'ADD_PROFILE'})")
    @PostMapping
    public ApiResponse<UserResponse> addUser(@RequestBody @Valid UserCreationRequest request) {
        var userResponse = userService.createUser(request);
        return ApiResponse.<UserResponse>builder()
                .code(1000)
                .data(userResponse)
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'EDIT_PROFILE'})")
    @PutMapping("/{userId}")
    public ApiResponse<UserResponse> updateUser(@PathVariable String userId, @RequestBody @Valid UserUpdateRequest request) {
        var result = userService.updateUser(userId, request);
        return ApiResponse.<UserResponse>builder()
                .code(1000)
                .data(result)
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping
    public ApiResponse<Void> deleteUser(@RequestBody UserDeletionReq request) {
        userService.deleteUserById(request);
        return ApiResponse.<Void>builder().code(1000).message("Deleted!").build();
    }


}
