package com.lhduyanh.garagemanagement.mapper;

import com.lhduyanh.garagemanagement.dto.request.ModelRequest;
import com.lhduyanh.garagemanagement.dto.response.ModelResponse;
import com.lhduyanh.garagemanagement.dto.response.ModelSimpleResponse;
import com.lhduyanh.garagemanagement.entity.Model;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ModelMapper {

    @Mapping(target = "brand", ignore = true)
    Model toModel(ModelRequest modelRequest);

    @Mapping(target = "brand", source = "brand")
    ModelResponse toModelResponse(Model model);

    ModelSimpleResponse toModelSimpleResponse(Model model);
}
