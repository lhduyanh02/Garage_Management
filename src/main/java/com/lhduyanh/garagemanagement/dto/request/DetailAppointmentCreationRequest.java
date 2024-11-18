package com.lhduyanh.garagemanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class DetailAppointmentCreationRequest {

    @NotNull(message = "BLANK_SERVICE")
    @NotBlank(message = "BLANK_SERVICE")
    String serviceId;

    String optionId;

}
