package com.lhduyanh.garagemanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AppointmentUpdateRequest {

    @NotNull(message = "BLANK_APPOINTMENT_TIME")
    LocalDateTime time;

    @Size(max = 65000, message = "DESCRIPTION_LENGTH")
    String description;

    List<DetailAppointmentCreationRequest> details;
}
