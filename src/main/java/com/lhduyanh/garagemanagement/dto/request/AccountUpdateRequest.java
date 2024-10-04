package com.lhduyanh.garagemanagement.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AccountUpdateRequest {

    @Email(message = "INVALID_EMAIL")
    @NotBlank(message = "BLANK_EMAIL")
    String email;

    @NotBlank(message = "BLANK_USER")
    String userId;

}
