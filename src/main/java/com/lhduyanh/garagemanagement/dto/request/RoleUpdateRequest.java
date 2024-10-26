package com.lhduyanh.garagemanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoleUpdateRequest {

    @NotNull(message = "BLANK_NAME")
    @NotBlank(message = "BLANK_NAME")
    String roleName;

    @NotNull(message = "BLANK_ROLEKEY")
    @NotBlank(message = "BLANK_ROLEKEY")
    String roleKey;

    int status = 1;

    @NotEmpty(message = "EMPTY_PERMISSION_LIST")
    List<String> permissions;
}
