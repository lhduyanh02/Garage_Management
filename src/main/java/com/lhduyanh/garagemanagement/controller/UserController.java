package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.UserCreationRequest;
import com.lhduyanh.garagemanagement.dto.request.UserDeletionReq;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.UserResponse;
import com.lhduyanh.garagemanagement.entity.User;
import com.lhduyanh.garagemanagement.repository.AddressRepository;
import com.lhduyanh.garagemanagement.repository.RoleRepository;
import com.lhduyanh.garagemanagement.service.UserService;
import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
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
//    @PreAuthorize("@securityExpression.hasPermission({'GET_ACCOUNT_LIST', 'GET_USER_LIST'})")
    public ApiResponse<List<UserResponse>> getAllUsers() {

        log.warn("\n\n\nAUTHENTICATE SUCCESS!!!\n\n\n");

//        var auth = SecurityContextHolder.getContext().getAuthentication();
//
//        log.info("email: {}", auth.getName());
//        auth.getAuthorities().forEach(grantedAuthority -> log.info(grantedAuthority.getAuthority()));
//
//        Jwt jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
//        var id = jwt.getClaimAsString("UUID");
//        log.info("\n\n\nUUID:" + id + "\n\n\n");
//
//        List<String> permissionKey = new ArrayList<>();
//        permissionKey.add("GET_USER_LIST");
//        permissionKey.add("GET_ACCOUNT_LIST");
//        var roleIds = roleRepository.findRolesByUserId(id).stream().map(role -> role.getId()).toList();
//        roleIds.forEach(roleId -> log.info("Role: " + roleId));
//
//        if(roleRepository.existByRoleIdsAndPermissionKeys(roleIds, permissionKey)){
//
//        }
//        else {
//            log.info("\n\n\nAUTHENTICATE UNSUCCESS!!!\n\n\n");
//        }


        return ApiResponse.<List<UserResponse>>builder()
                .code(1000)
                .data(userService.getAllUserWithAddress())
                .build();
    }

    @PostMapping
    public ApiResponse addUser(@RequestBody @Valid UserCreationRequest request) {

        User user = userService.createUser(request);

        ApiResponse apiResponse = ApiResponse.builder()
                .code(500)
                .message("Can not create user")
                .build();

        if(user != null) {
            apiResponse = ApiResponse.builder()
                    .code(200)
                    .message("Create success")
                    .build();
        }
        return apiResponse;
    }

    @DeleteMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Boolean> deleteUser(@RequestBody UserDeletionReq request) {
        boolean result = userService.deleteUserById(request);
        if(result){
            return ApiResponse.<Boolean>builder().code(1000).data(result).build();
        }
        return ApiResponse.<Boolean>builder().code(1000).data(result).build();
    }
}
