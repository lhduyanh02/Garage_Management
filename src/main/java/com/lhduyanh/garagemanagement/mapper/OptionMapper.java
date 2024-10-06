package com.lhduyanh.garagemanagement.mapper;

import com.lhduyanh.garagemanagement.dto.request.OptionCreationRequest;
import com.lhduyanh.garagemanagement.dto.request.OptionUpdateRequest;
import com.lhduyanh.garagemanagement.dto.response.OptionFullResponse;
import com.lhduyanh.garagemanagement.dto.response.OptionPriceResponse;
import com.lhduyanh.garagemanagement.dto.response.OptionSimpleResponse;
import com.lhduyanh.garagemanagement.entity.Options;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = { PriceMapper.class })
public interface OptionMapper {

    Options toOption(OptionCreationRequest request);

    OptionSimpleResponse toSimpleResponse(Options options);

//    OptionPriceResponse toOptionPriceResponse(Options options);

    @Mapping(target = "servicePrices", source = "prices")
    OptionFullResponse toOptionFullResponse(Options options);

    void updateOption(@MappingTarget Options options, OptionUpdateRequest request);

//    Option toServiceClass(ServiceClassRequest request);
//
//    OptionSimpleResponse toSimpleResponse(Option option);
//
//    void updateServiceClass(@MappingTarget Option option, ServiceClassRequest request);
//
//    @Mapping(target = "id", source = "id")
//    @Mapping(target = "name", source = "name")
//    @Mapping(target = "status", source = "status")
//    @Mapping(target = "services", source = "services")
//    ServiceFullResponse toServiceFullResponse(Option option);
}
