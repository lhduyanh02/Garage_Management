package com.lhduyanh.garagemanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoleCreationRequest {

    @NotBlank(message = "BLANK_NAME")
    String roleName;

    @NotBlank(message = "BLANK_ROLEKEY")
    String roleKey;

    int status = 1;

    List<String> permissions;
}
