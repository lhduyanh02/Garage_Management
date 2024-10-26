package com.lhduyanh.garagemanagement.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PermissionSimpleResponse {

    String id;
    String name;
    String permissionKey;

}
