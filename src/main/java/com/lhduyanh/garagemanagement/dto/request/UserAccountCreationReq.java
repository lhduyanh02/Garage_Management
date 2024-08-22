package com.lhduyanh.garagemanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Set;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserAccountCreationReq {

    @Email(message = "INVALID_EMAIL")
    @NotBlank(message = "BLANK_EMAIL")
    String email;

    @NotNull(message = "BLANK_PASSWORD")
    @Size(min = 8, message = "INVALID_PASSWORD")
    String password;

    @NotBlank(message = "BLANK_NAME")
    String name;

    @Pattern(regexp = "^(0|\\+[0-9]{1,3})[0-9 ]{6,13}$", message = "INVALID_PHONE_NUMBER")
    String phone;

    int gender;

    int addressId;

    List<String> roleIds;

    @NotNull(message = "BLANK_STATUS")
    int status;
}
