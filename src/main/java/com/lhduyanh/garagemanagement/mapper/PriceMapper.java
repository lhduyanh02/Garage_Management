package com.lhduyanh.garagemanagement.mapper;

import com.lhduyanh.garagemanagement.dto.response.OptionPriceResponse;
import com.lhduyanh.garagemanagement.dto.response.PriceResponse;
import com.lhduyanh.garagemanagement.dto.response.ServicePriceResponse;
import com.lhduyanh.garagemanagement.entity.Price;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PriceMapper {

    @Mapping(target = "id", source = "options.id")
    @Mapping(target = "name", source = "options.name")
    @Mapping(target = "status", source = "options.status")
    @Mapping(target = "price", source = "price")
    @Mapping(target = "priceStatus", source = "status")
    OptionPriceResponse toOptionPriceResponse(Price price);

    List<OptionPriceResponse> toOptionPriceResponseList(List<Price> prices);

    @Mapping(target = "id", source = "service.id")
    @Mapping(target = "name", source = "service.name")
    @Mapping(target = "description", source = "service.description")
    @Mapping(target = "status", source = "service.status")
    @Mapping(target = "price", source = "price")
    @Mapping(target = "priceStatus", source = "status")
    ServicePriceResponse toServicePriceResponse(Price price);

    List<ServicePriceResponse> toServicePriceResponseList(List<Price> prices);

    @Mapping(target = "service", source = "service")
    @Mapping(target = "option", source = "options")
    PriceResponse toPriceResponse(Price price);

}
