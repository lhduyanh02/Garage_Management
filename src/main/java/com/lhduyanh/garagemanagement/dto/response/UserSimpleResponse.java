package com.lhduyanh.garagemanagement.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserSimpleResponse {
    String id;
    String name;
    String phone;
    long telegramId;
    int gender;
    int status;
    AddressResponse address;
    Set<RoleSimpleResponse> roles;
}
