package com.lhduyanh.garagemanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CarRequest {

    @NotBlank(message = "BLANK_NUM_PLATE")
    @Size(max = 50, message = "NUM_PLATE_LENGTH")
    String numPlate;

    @Size(max = 200, message = "CAR_COLOR_LENGTH")
    String color;

    @Size(max = 1000, message = "CAR_DETAIL_LENGTH")
    String carDetail;

    int plateType;

    int model;

}
