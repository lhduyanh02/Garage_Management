package com.lhduyanh.garagemanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HistoryCreationRequest {

    @NotBlank(message = "BLANK_CAR")
    String carId;

    @NotBlank(message = "INVALID_ADVISOR")
    String advisorId;

}
