package com.lhduyanh.garagemanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HistoryUserUpdate {

    @NotBlank(message = "BLANK_HISTORY")
    String historyId;

    @NotBlank(message = "BLANK_USER")
    String userId;

    Boolean isConfirm;
}
