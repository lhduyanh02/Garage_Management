package com.lhduyanh.garagemanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class UserCarMappingRequest {

    @NotBlank(message = "BLANK_USER")
    String userId;

    @NotBlank(message = "BLANK_CAR")
    String carId;

}
