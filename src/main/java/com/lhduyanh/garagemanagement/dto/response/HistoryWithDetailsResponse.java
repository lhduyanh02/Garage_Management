package com.lhduyanh.garagemanagement.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HistoryWithDetailsResponse {
    String id;
    CarResponse car;
    UserWithAccountsResponse advisor;
    UserWithAccountsResponse customer;
    Long odo;
    LocalDateTime serviceDate;
    String summary;
    String diagnose;
    Double totalAmount;
    Float discount;
    Float tax;
    Double payableAmount;
    int status;
    List<DetailHistoryResponse> details;
}
