package com.lhduyanh.garagemanagement.mapper;

import com.lhduyanh.garagemanagement.dto.request.ServiceCreationRequest;
import com.lhduyanh.garagemanagement.dto.request.ServiceUpdateRequest;
import com.lhduyanh.garagemanagement.dto.response.ServiceResponse;
import com.lhduyanh.garagemanagement.dto.response.ServiceSimpleResponse;
import com.lhduyanh.garagemanagement.entity.Service;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = { PriceMapper.class })
public interface ServiceMapper {

    @Mapping(target = "prices", ignore = true)
    Service toService(ServiceCreationRequest request);

    ServiceSimpleResponse toSimpleResponse(Service service);

    @Mapping(target = "prices", ignore = true)
    void updateService(@MappingTarget Service service, ServiceUpdateRequest request);

    @Mapping(target = "optionPrices", source = "prices")
    ServiceResponse toServiceResponse(Service service);

}
