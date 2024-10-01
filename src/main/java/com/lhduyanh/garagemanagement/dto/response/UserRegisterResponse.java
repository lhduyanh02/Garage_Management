package com.lhduyanh.garagemanagement.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserRegisterResponse {
    String id;
    String email;
    String name;
    String phone;
    int gender;
    AddressResponse address;
    int status;
    List<RoleSimpleResponse> roles;
}
