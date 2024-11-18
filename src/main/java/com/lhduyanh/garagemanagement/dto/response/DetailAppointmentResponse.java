package com.lhduyanh.garagemanagement.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DetailAppointmentResponse {

    String id;
    String appointmentId;

    ServiceSimpleResponse service;
    String serviceName;

    OptionSimpleResponse option;
    String optionName;

}
