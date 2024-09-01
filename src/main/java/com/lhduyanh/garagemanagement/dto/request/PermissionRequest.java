package com.lhduyanh.garagemanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PermissionRequest {

    @NotBlank(message = "BLANK_NAME")
    String name;

    @NotBlank(message = "BLANK_PERMISSIONKEY")
    String permissionKey;

    @NotBlank(message = "BLANK_FUNCTION")
    String functionId;

}
