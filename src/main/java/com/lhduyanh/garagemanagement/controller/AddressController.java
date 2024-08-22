package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.entity.Address;
import com.lhduyanh.garagemanagement.service.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static java.util.Objects.isNull;

@RestController
@RequestMapping("/addresses")
public class AddressController {

    @Autowired
    private AddressService addressService;

//    @GetMapping
//    public ApiResponse getAddress() {
//        List<Address> addresses = addressService.findAll();
//
//        return ApiResponse.builder()
//                .code(200)
//                .data(addresses)
//                .build();
//    }

    @GetMapping
    public ApiResponse getAddressById(@RequestParam(required = false) int id) {
        if (!isNull(id)){
            Address address = addressService.findById(id);

            return ApiResponse.builder()
                    .code(200)
                    .data(address)
                    .build();
        }
        else {
            List<Address> addresses = addressService.findAll();

            return ApiResponse.builder()
                    .code(200)
                    .data(addresses)
                    .build();
        }
    }
}
