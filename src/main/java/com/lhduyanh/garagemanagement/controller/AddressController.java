package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.response.AddressResponse;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.entity.Address;
import com.lhduyanh.garagemanagement.service.AddressService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static java.util.Objects.isNull;

@RestController
@RequestMapping("/addresses")
@Slf4j
public class AddressController {

    @Autowired
    private AddressService addressService;

    @GetMapping("/{id}")
    public ApiResponse<AddressResponse> getAddressById(@PathVariable int id) {
        return ApiResponse.<AddressResponse>builder()
                .code(1000)
                .data(addressService.findById(id))
                .build();
    }
    @GetMapping
    public ApiResponse<List<AddressResponse>> getAllAddresses() {
        return ApiResponse.<List<AddressResponse>>builder()
                .code(1000)
                .data(addressService.findAll())
                .build();
    }
}
