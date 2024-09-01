package com.lhduyanh.garagemanagement.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.lhduyanh.garagemanagement.entity.Address;
import com.lhduyanh.garagemanagement.entity.Role;
import lombok.*;
import lombok.experimental.FieldDefaults;

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
    int gender;
    int status;
    Address address;
    Set<RoleBodyResponse> roles;
}
