package com.lhduyanh.garagemanagement.mapper;

import com.lhduyanh.garagemanagement.dto.response.OptionPriceResponse;
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
    OptionPriceResponse toOptionPriceResponse(Price price);

    List<OptionPriceResponse> toOptionPriceResponseList(List<Price> prices);
}
