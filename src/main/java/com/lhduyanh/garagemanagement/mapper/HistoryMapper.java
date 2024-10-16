package com.lhduyanh.garagemanagement.mapper;

import com.lhduyanh.garagemanagement.dto.response.HistoryResponse;
import com.lhduyanh.garagemanagement.dto.response.HistoryWithDetailsResponse;
import com.lhduyanh.garagemanagement.entity.History;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {CarMapper.class, UserMapper.class, DetailHistoryMapper.class})
public interface HistoryMapper {

    @Mapping(target = "car", source = "car")
    @Mapping(target = "advisor", source = "advisor")
    @Mapping(target = "customer", source = "customer")
    HistoryResponse toHistoryResponse(History history);

    @Mapping(target = "car", source = "car")
    @Mapping(target = "advisor", source = "advisor")
    @Mapping(target = "customer", source = "customer")
    @Mapping(target = "details", source = "details")
    HistoryWithDetailsResponse toHistoryWithDetailsResponse(History history);


}
