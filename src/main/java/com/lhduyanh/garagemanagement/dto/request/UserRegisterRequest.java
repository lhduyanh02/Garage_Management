package com.lhduyanh.garagemanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserRegisterRequest {

    @Email(message = "INVALID_EMAIL")
    @NotBlank(message = "BLANK_EMAIL")
    String email;

    @NotNull(message = "BLANK_PASSWORD")
    @Size(min = 8, message = "INVALID_PASSWORD")
    String password;

    @NotBlank(message = "BLANK_NAME")
    String name;

    @Pattern(regexp = "^(0|\\+[0-9]{1,3})[0-9 ]{6,15}$", message = "INVALID_PHONE_NUMBER")
    @Size(max = 50, message = "PHONE_NUMBER_LENGTH")
    String phone;

    int gender;

    int addressId;

}
