package com.lhduyanh.garagemanagement.mapper;

import com.lhduyanh.garagemanagement.dto.response.DetailAppointmentResponse;
import com.lhduyanh.garagemanagement.entity.DetailAppointment;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface DetailAppointmentMapper {

    DetailAppointmentResponse toResponse(DetailAppointment detailAppointment);

}
