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
public class PasswordRecoveryRequest {

//    @NotNull(message = "BLANK_OTP")
//    @NotBlank(message = "BLANK_OTP")
    String otpCode;

    @NotNull(message = "BLANK_EMAIL")
    @NotBlank(message = "BLANK_EMAIL")
    String email;

    @NotNull(message = "BLANK_PASSWORD")
    @Size(min = 8, message = "INVALID_PASSWORD")
    String newPassword;

}
