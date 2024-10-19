package com.lhduyanh.garagemanagement.dto.response;

import com.lhduyanh.garagemanagement.entity.Address;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
//@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserResponse {
    String id;
    String name;
    String phone;
    long telegramId;
    int gender;
    int status;
    AddressResponse address;
    Set<RoleSimpleResponse> roles;
    List<CarResponse> cars;
}
