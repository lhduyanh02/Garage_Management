package com.lhduyanh.garagemanagement.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class CarResponse {
    String id;
    String numPlate;
    String color;
    String carDetail;
    LocalDateTime createAt;
    int status;
    PlateTypeResponse plateType;
    ModelResponse model;
}
