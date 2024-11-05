package com.lhduyanh.garagemanagement.dto.request;

import jakarta.validation.constraints.*;
import lombok.AccessLevel;
import lombok.Data;
import lombok.ToString;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Data
@ToString
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerCreationRequest {

    @NotNull(message = "BLANK_NAME")
    @NotBlank(message = "BLANK_NAME")
    String name;

    @Email(message = "INVALID_EMAIL")
    String email;

    @Pattern(regexp = "^(0|\\+[0-9]{1,3})[0-9 ]{6,15}$", message = "INVALID_PHONE_NUMBER")
    @Size(max = 50, message = "PHONE_NUMBER_LENGTH")
    String phone;

    int gender;

    int addressId;

}
