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
public class CarManagersResponse {
    String id;
    String numPlate;
    String color;
    String carDetail;
    LocalDateTime createAt;
    int status;
    PlateTypeResponse plateType;
    ModelResponse model;
    List<UserWithAccountsResponse> managers;
}
