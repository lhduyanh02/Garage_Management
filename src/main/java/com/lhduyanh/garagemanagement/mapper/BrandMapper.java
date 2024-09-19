package com.lhduyanh.garagemanagement.mapper;

import com.lhduyanh.garagemanagement.dto.request.BrandRequest;
import com.lhduyanh.garagemanagement.dto.response.BrandModelResponse;
import com.lhduyanh.garagemanagement.dto.response.BrandSimpleResponse;
import com.lhduyanh.garagemanagement.entity.Brand;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BrandMapper {
     Brand toBrand(BrandRequest brandRequest);

     BrandSimpleResponse toBrandSimpleResponse(Brand brand);

     @Mapping(target = "models", source = "models")
     BrandModelResponse toBrandModelResponse(Brand brand);
}
