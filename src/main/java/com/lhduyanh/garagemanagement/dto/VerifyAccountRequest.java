package com.lhduyanh.garagemanagement.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VerifyAccountRequest {
    @Email
    @NotNull
    private String email;
    @NotNull
    private String otpCode;
}
