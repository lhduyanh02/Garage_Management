package com.lhduyanh.garagemanagement.mapper;

import com.lhduyanh.garagemanagement.dto.request.PlateTypeRequest;
import com.lhduyanh.garagemanagement.dto.response.PlateTypeFullResponse;
import com.lhduyanh.garagemanagement.dto.response.PlateTypeResponse;
import com.lhduyanh.garagemanagement.entity.PlateType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PlateTypeMapper {

    PlateType toPlateType(PlateTypeRequest request);

    PlateTypeResponse toPlateTypeResponse(PlateType plateType);

    @Mapping(target = "carQuantity", ignore = true)
    PlateTypeFullResponse toPlateTypeFullResponse(PlateType plateType);

}
