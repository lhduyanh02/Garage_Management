package com.lhduyanh.garagemanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class PasswordChangeRequest {

    @NotNull(message = "ACCOUNT_NOT_EXISTED")
    @NotBlank(message = "ACCOUNT_NOT_EXISTED")
    String accountId;

    @NotNull
    @NotBlank
    String oldPassword;

    @NotNull(message = "BLANK_PASSWORD")
    @Size(min = 8, message = "INVALID_PASSWORD")
    String newPassword;
}
