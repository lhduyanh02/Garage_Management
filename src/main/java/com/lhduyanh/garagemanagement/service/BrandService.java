package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.request.BrandRequest;
import com.lhduyanh.garagemanagement.dto.response.BrandModelResponse;
import com.lhduyanh.garagemanagement.dto.response.BrandSimpleResponse;
import com.lhduyanh.garagemanagement.dto.response.ModelSimpleResponse;
import com.lhduyanh.garagemanagement.entity.Brand;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.mapper.BrandMapper;
import com.lhduyanh.garagemanagement.repository.BrandRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.text.Collator;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BrandService {

    BrandRepository brandRepository;
    BrandMapper brandMapper;
    private final Collator vietnameseCollator;

    public List<BrandSimpleResponse> getAllBrand() {
        return brandRepository.findAll()
                .stream().map(brandMapper::toBrandSimpleResponse)
                .toList();
    }

    public List<BrandModelResponse> getAllBrandModel() {
        List<Brand> brands = brandRepository.findAllBrandModel();
        var response = brands.stream()
                .map(brandMapper::toBrandModelResponse)
                .sorted(Comparator.comparing(BrandModelResponse::getBrand, vietnameseCollator))
                .toList();

        response.forEach(res -> {
            res.getModels().sort(Comparator.comparing(ModelSimpleResponse::getModel));
        });

        return response;
    }

    public BrandModelResponse getBrandById(int id) {
        Brand brand = brandRepository.findByIdAndFetchModels(id)
                .orElseThrow(() -> new AppException(ErrorCode.BRAND_NOT_EXISTS));
        return brandMapper.toBrandModelResponse(brand);
    }

    public BrandSimpleResponse newBrand(BrandRequest request) {
        request.setBrand(request.getBrand().trim());
        if (brandRepository.existsByBrand(request.getBrand())){
            throw new AppException(ErrorCode.BRAND_NAME_EXISTED);
        }
        Brand brand = brandMapper.toBrand(request);
        brand = brandRepository.save(brand);
        return brandMapper.toBrandSimpleResponse(brand);
    }

    public BrandSimpleResponse updateBrand(int id, BrandRequest request) {
        request.setBrand(request.getBrand().trim());
        if (brandRepository.existsByBrand(request.getBrand())){
            throw new AppException(ErrorCode.BRAND_NAME_EXISTED);
        }
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BRAND_NOT_EXISTS));

        brand.setBrand(request.getBrand());
        return brandMapper.toBrandSimpleResponse(brandRepository.save(brand));
    }

}
