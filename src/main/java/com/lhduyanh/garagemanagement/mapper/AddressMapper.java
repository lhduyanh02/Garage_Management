package com.lhduyanh.garagemanagement.mapper;

import com.lhduyanh.garagemanagement.dto.response.AddressResponse;
import com.lhduyanh.garagemanagement.entity.Address;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AddressMapper {
    AddressResponse toAddressResponse(Address address);
}
