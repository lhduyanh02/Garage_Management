package com.lhduyanh.garagemanagement.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
@Data
public class AccountCreationRequest {
    @Email
    @NotNull(message = "Email is required")
    @NotBlank(message = "Email is required")
    private String email;
    @NotNull
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
    @NotNull(message = "Last name must not be null")
    @NotBlank(message = "Last name must not be null")
    private String ho;
    @NotNull(message = "First name must not be null")
    @NotBlank(message = "First name must not be null")
    private String ten;
    @NotNull(message = "Date of birth must not be null")
    private LocalDate ngaysinh;
    private String sdt;
}
