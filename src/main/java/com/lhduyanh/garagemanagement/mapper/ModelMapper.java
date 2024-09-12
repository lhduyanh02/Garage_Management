package com.lhduyanh.garagemanagement.mapper;

import com.lhduyanh.garagemanagement.dto.request.ModelRequest;
import com.lhduyanh.garagemanagement.dto.response.ModelResponse;
import com.lhduyanh.garagemanagement.entity.Model;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ModelMapper {

    public Model toModel(ModelRequest modelRequest);

    public ModelResponse toModelResponse(Model model);

}
