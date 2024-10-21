package com.lhduyanh.garagemanagement.dto.request;

import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HistoryInfoUpdateRequest {

    @Size(max = 65000, message = "TEXT_LENGTH")
    String summary;

    @Size(max = 65000, message = "TEXT_LENGTH")
    String diagnose;

    Float discount;

    Long odo;
}
