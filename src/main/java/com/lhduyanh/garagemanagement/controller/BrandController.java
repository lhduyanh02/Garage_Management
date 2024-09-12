package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.BrandRequest;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.BrandModelResponse;
import com.lhduyanh.garagemanagement.dto.response.BrandResponse;
import com.lhduyanh.garagemanagement.service.BrandService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/brands")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class BrandController {

    BrandService brandService;

    @GetMapping
    public ApiResponse<List<BrandResponse>> getAllBrands() {
        return ApiResponse.<List<BrandResponse>>builder()
                .code(1000)
                .data(brandService.getAllBrand())
                .build();
    }


    @GetMapping("/fetch-model")
    public ApiResponse<List<BrandModelResponse>> getAllBrandModel() {
        return ApiResponse.<List<BrandModelResponse>>builder()
                .code(1000)
                .data(brandService.getAllBrandModel())
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<BrandResponse> getBrandById(@PathVariable int id) {
        return ApiResponse.<BrandResponse>builder()
                .code(1000)
                .data(brandService.getBrandById(id))
                .build();
    }

    @PostMapping
    public ApiResponse<BrandResponse> newBrand(@RequestBody @Valid BrandRequest request) {
        return ApiResponse.<BrandResponse>builder()
                .code(1000)
                .data(brandService.newBrand(request))
                .build();
    }

    @PutMapping
    public ApiResponse<BrandResponse> updateBrand(@RequestParam("id") int id, @RequestBody @Valid BrandRequest request) {
        return ApiResponse.<BrandResponse>builder()
                .code(1000)
                .data(brandService.updateBrand(id, request))
                .build();
    }
}
