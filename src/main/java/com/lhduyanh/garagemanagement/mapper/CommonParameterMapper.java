package com.lhduyanh.garagemanagement.mapper;

import com.lhduyanh.garagemanagement.dto.request.CommonParameterCreationRequest;
import com.lhduyanh.garagemanagement.dto.request.CommonParameterEditRequest;
import com.lhduyanh.garagemanagement.dto.response.CommonParameterResponse;
import com.lhduyanh.garagemanagement.entity.CommonParameter;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CommonParameterMapper {

    CommonParameterResponse toResponse(CommonParameter commonParameter);

    @Mapping(target = "description", source = "description")
    @Mapping(target = "value", source = "value")
    void updateCommonParameter(@MappingTarget CommonParameter target, CommonParameterEditRequest request);

    CommonParameter toCommonParameter(CommonParameterCreationRequest request);

}
