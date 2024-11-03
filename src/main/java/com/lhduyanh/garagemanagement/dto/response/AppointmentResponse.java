package com.lhduyanh.garagemanagement.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class AppointmentResponse {

    String id;
    LocalDateTime time;
    LocalDateTime createAt;
    UserWithAccountsResponse customer;
    UserWithAccountsResponse advisor;
    String contact;
    String description;
    int status;
    List<DetailAppointmentResponse> details;

}
