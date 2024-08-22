package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.UserCreationRequest;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.UserResponse;
import com.lhduyanh.garagemanagement.entity.Address;
import com.lhduyanh.garagemanagement.entity.User;
import com.lhduyanh.garagemanagement.repository.AddressRepository;
import com.lhduyanh.garagemanagement.service.AddressService;
import com.lhduyanh.garagemanagement.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.executable.ValidateOnExecution;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class UserController {
    @Autowired
    UserService userService;
    @Autowired
    AddressRepository addressRepository;

    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {
        return userService.getAllUserWithAddress();
    }

    @PostMapping("/users")
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
}
