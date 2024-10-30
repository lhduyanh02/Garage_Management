package com.lhduyanh.garagemanagement.mapper;

import com.lhduyanh.garagemanagement.dto.response.AppointmentResponse;
import com.lhduyanh.garagemanagement.entity.Appointment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AppointmentMapper {

    @Mapping(target = "details", ignore = true)
    AppointmentResponse toResponse(Appointment appointment);

}
