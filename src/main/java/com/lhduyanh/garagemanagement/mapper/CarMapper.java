package com.lhduyanh.garagemanagement.mapper;

import com.lhduyanh.garagemanagement.dto.request.CarRequest;
import com.lhduyanh.garagemanagement.dto.response.CarResponse;
import com.lhduyanh.garagemanagement.entity.Car;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CarMapper {

    @Mapping(target = "plateType", ignore = true)
    @Mapping(target = "model", ignore = true)
    @Mapping(target = "status", ignore = true)
    Car toCar(CarRequest request);

    @Mapping(target = "plateType", source = "plateType")
    @Mapping(target = "model", source = "model")
    CarResponse toCarResponse(Car car);

    @Mapping(target = "plateType", ignore = true)
    @Mapping(target = "model", ignore = true)
    void updateCar(@MappingTarget Car car, CarRequest request);

}
