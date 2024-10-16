package com.lhduyanh.garagemanagement.mapper;

import com.lhduyanh.garagemanagement.dto.response.DetailHistoryResponse;
import com.lhduyanh.garagemanagement.entity.DetailHistory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DetailHistoryMapper {

    @Mapping(target = "service", source = "service")
    @Mapping(target = "option", source = "option")
    DetailHistoryResponse toResponse(DetailHistory detailHistory);

}
