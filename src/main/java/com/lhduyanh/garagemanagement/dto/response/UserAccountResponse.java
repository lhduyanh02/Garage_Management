package com.lhduyanh.garagemanagement.dto.response;

import com.lhduyanh.garagemanagement.entity.Address;
import com.lhduyanh.garagemanagement.repository.RoleRepository;
import jakarta.persistence.FieldResult;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserAccountResponse {

    String id;
    String email;
    String name;
    String phone;
    int gender;
    Address address;
    int status;
    List<RoleBodyResponse> roles;

}
