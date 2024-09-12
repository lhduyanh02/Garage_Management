package com.lhduyanh.garagemanagement.mapper;

import com.lhduyanh.garagemanagement.dto.request.PlateTypeRequest;
import com.lhduyanh.garagemanagement.dto.response.PlateTypeResponse;
import com.lhduyanh.garagemanagement.entity.PlateType;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PlateTypeMapper {

    PlateType toPlateType(PlateTypeRequest request);

    PlateTypeResponse toPlateTypeResponse(PlateType plateType);

}
