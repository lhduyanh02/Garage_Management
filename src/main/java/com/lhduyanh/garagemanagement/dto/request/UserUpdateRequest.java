package com.lhduyanh.garagemanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Data;
import lombok.ToString;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Data
@ToString
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserUpdateRequest {
    @NotBlank(message = "BLANK_NAME")
    String name;

    @Pattern(regexp = "^(0|\\+[0-9]{1,3})[0-9 ]{6,15}$", message = "INVALID_PHONE_NUMBER")
    @Size(max = 50, message = "PHONE_NUMBER_LENGTH")
    String phone;

    int gender;

    int addressId;

    Set<String> roleIds;

    Long telegramId;
}
