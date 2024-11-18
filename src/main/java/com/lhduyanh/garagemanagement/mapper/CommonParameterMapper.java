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

    CommonParameter toCommonParameter(CommonParameterCreationRequest request);

}
