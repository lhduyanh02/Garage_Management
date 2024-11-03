package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.UserCarMappingRequest;
import com.lhduyanh.garagemanagement.dto.request.UserCreationRequest;
import com.lhduyanh.garagemanagement.dto.request.UserUpdateRequest;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.UserFullResponse;
import com.lhduyanh.garagemanagement.dto.response.UserResponse;
import com.lhduyanh.garagemanagement.dto.response.UserWithAccountsResponse;
import com.lhduyanh.garagemanagement.repository.AddressRepository;
import com.lhduyanh.garagemanagement.repository.RoleRepository;
import com.lhduyanh.garagemanagement.repository.UserRepository;
import com.lhduyanh.garagemanagement.service.UserService;
import jakarta.annotation.security.PermitAll;
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

    @GetMapping
    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_USER', 'EDIT_USER'})")
    public ApiResponse<List<UserResponse>> getAllUsers() { // All disabled and no role user
        return ApiResponse.<List<UserResponse>>builder()
                .code(1000)
                .data(userService.getAllUserWithAddress())
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_USER', 'EDIT_USER', 'EDIT_CUSTOMER'})")
    @GetMapping("/{id}")
    public ApiResponse<UserFullResponse> getUserById(@PathVariable String id) {
        return ApiResponse.<UserFullResponse>builder()
                .code(1000)
                .data(userService.getUserById(id))
                .build();
    }

    @GetMapping("/is-active")
    @PreAuthorize("@securityExpression.hasPermission({'GET_ACCOUNT_LIST', 'GET_USER_LIST'})")
    public ApiResponse<List<UserResponse>> getAllActivateUsers() {
        return ApiResponse.<List<UserResponse>>builder()
                .code(1000)
                .data(userService.getAllActiveUser())
                .build();
    }

    @GetMapping("/customers")
    @PreAuthorize("""
        @securityExpression.hasPermission({'GET_ALL_CUSTOMER', 'GET_ALL_USER', 'EDIT_USER',
                                            'MAP_USER_CAR',
                                            'BOOKING', 'EDIT_APPOINTMENT'})
        """)
    public ApiResponse<List<UserFullResponse>> getAllActiveCustomers() {
        return ApiResponse.<List<UserFullResponse>>builder()
                .code(1000)
                .data(userService.getAllActiveCustomers())
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_USER', 'EDIT_USER', 'BOOKING', 'EDIT_APPOINTMENT'})")
    @GetMapping("/with-accounts")
    public ApiResponse<List<UserWithAccountsResponse>> getAllUserWithAccounts(){
        return ApiResponse.<List<UserWithAccountsResponse>>builder()
                .code(1000)
                .data(userService.getAllUserWithAccounts())
                .build();
    }

    @GetMapping("/get-my-info")
    public ApiResponse<UserFullResponse> getMyInfo() {
        return ApiResponse.<UserFullResponse>builder()
                .code(1000)
                .data(userService.getMyUserInfo())
                .build();
    }

    @PermitAll
    @GetMapping("/get-quantity")
    public ApiResponse<Long> getUserQuantity(){
        return ApiResponse.<Long>builder()
                .code(1000)
                .data(userService.getCustomerQuantity())
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'ADD_USER'})")
    @PostMapping
    public ApiResponse<UserResponse> addUser(@RequestBody @Valid UserCreationRequest request) {
        var userResponse = userService.createUser(request);
        return ApiResponse.<UserResponse>builder()
                .code(1000)
                .data(userResponse)
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'EDIT_USER'})")
    @PutMapping("/{userId}")
    public ApiResponse<UserResponse> updateUser(@PathVariable String userId, @RequestBody @Valid UserUpdateRequest request) {
        var result = userService.updateUser(userId, request);
        return ApiResponse.<UserResponse>builder()
                .code(1000)
                .data(result)
                .build();
    }

    @PutMapping("/self-update")
    public ApiResponse<UserFullResponse> userSelfUpdate(@RequestBody @Valid UserUpdateRequest request) {
        return ApiResponse.<UserFullResponse>builder()
                .code(1000)
                .data(userService.userSelfUpdate(request))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'EDIT_USER'})")
    @PutMapping("/disable/{id}")
    public ApiResponse<Boolean> disableUser(@PathVariable String id) {
        userService.disableUserById(id);
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .data(true)
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'EDIT_USER'})")
    @PutMapping("/activate/{id}")
    public ApiResponse<Boolean> activateUser(@PathVariable String id) {
        userService.activateUserById(id);
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .data(true)
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'MAP_USER_CAR', 'EDIT_USER', 'SIGN_SERVICE'})")
    @PutMapping("/car-mapping")
    public ApiResponse<Boolean> userCarMapping(@RequestBody @Valid UserCarMappingRequest request){
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .data(userService.userCarMapping(request))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'MAP_USER_CAR', 'EDIT_USER'})")
    @PutMapping("/remove-car-mapping")
    public ApiResponse<Boolean> userCarRemoveMapping(@RequestBody @Valid UserCarMappingRequest request){
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .data(userService.userCarRemoveMapping(request))
                .build();
    }


    @PreAuthorize("@securityExpression.hasPermission({'DELETE_USER'})")
    @DeleteMapping("/{id}")
    public ApiResponse<Boolean> deleteUser(@PathVariable String id) {
        userService.deleteUserById(id);
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .data(true)
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'DELETE_USER'})")
    @DeleteMapping("/hard/{id}")
    public ApiResponse<Boolean> hardDeleteUser(@PathVariable String id) {
        userService.hardDeleteUserById(id);
        return ApiResponse.<Boolean>builder().code(1000).data(true).build();
    }

}
