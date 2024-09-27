package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.BrandRequest;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.BrandModelResponse;
import com.lhduyanh.garagemanagement.dto.response.BrandSimpleResponse;
import com.lhduyanh.garagemanagement.service.BrandService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/brands")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class BrandController {

    BrandService brandService;

    @GetMapping
    public ApiResponse<List<BrandSimpleResponse>> getAllBrands() {
        return ApiResponse.<List<BrandSimpleResponse>>builder()
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
    public ApiResponse<BrandModelResponse> getBrandById(@PathVariable int id) {
        return ApiResponse.<BrandModelResponse>builder()
                .code(1000)
                .data(brandService.getBrandById(id))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'ADMIN'})")
    @PostMapping
    public ApiResponse<BrandSimpleResponse> newBrand(@RequestBody @Valid BrandRequest request) {
        return ApiResponse.<BrandSimpleResponse>builder()
                .code(1000)
                .data(brandService.newBrand(request))
                .build();
    }

    @PutMapping
    public ApiResponse<BrandSimpleResponse> updateBrand(@RequestParam("id") int id, @RequestBody @Valid BrandRequest request) {
        return ApiResponse.<BrandSimpleResponse>builder()
                .code(1000)
                .data(brandService.updateBrand(id, request))
                .build();
    }
}
