package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.request.BrandRequest;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.BrandModelResponse;
import com.lhduyanh.garagemanagement.dto.response.BrandResponse;
import com.lhduyanh.garagemanagement.entity.Brand;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.mapper.BrandMapper;
import com.lhduyanh.garagemanagement.repository.BrandRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BrandService {

    BrandRepository brandRepository;
    BrandMapper brandMapper;

    public List<BrandResponse> getAllBrand() {
        return brandRepository.findAll()
                .stream().map(brandMapper::toBrandResponse)
                .toList();
    }

    public List<BrandModelResponse> getAllBrandModel() {
        List<Brand> brands = brandRepository.findAllBrandModel();
        return brands.stream()
                .map(brandMapper::toBrandModelResponse)
                .toList();
    }

    public BrandResponse getBrandById(int id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BRAND_NOT_EXISTS));
        return brandMapper.toBrandResponse(brand);
    }

    public BrandResponse newBrand(BrandRequest request) {
        if (brandRepository.existsByBrand(request.getBrand())){
            throw new AppException(ErrorCode.BRAND_NAME_EXISTED);
        }
        Brand brand = brandMapper.toBrand(request);
        brand = brandRepository.save(brand);
        return brandMapper.toBrandResponse(brand);
    }

    public BrandResponse updateBrand(int id, BrandRequest request) {
        if (brandRepository.existsByBrand(request.getBrand())){
            throw new AppException(ErrorCode.BRAND_NAME_EXISTED);
        }
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BRAND_NOT_EXISTS));

        brand.setBrand(request.getBrand());
        return brandMapper.toBrandResponse(brandRepository.save(brand));
    }

}
