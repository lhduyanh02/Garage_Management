package com.lhduyanh.garagemanagement.mapper;

import com.lhduyanh.garagemanagement.dto.request.UserAccountCreationReq;
import com.lhduyanh.garagemanagement.dto.request.UserCreationRequest;
import com.lhduyanh.garagemanagement.dto.response.UserAccountResponse;
import com.lhduyanh.garagemanagement.dto.response.UserResponse;
import com.lhduyanh.garagemanagement.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {

    public User toUser(UserCreationRequest request);

    @Mapping(target = "roles", source = "roles")
    public UserResponse toUserResponse(User user);

    @Mapping(source = "name", target = "name")
    @Mapping(source = "phone", target = "phone")
    @Mapping(source = "gender", target = "gender")
    @Mapping(target = "address", ignore = true)
    public User UserAccountReqToUser(UserAccountCreationReq userAccountCreationReq);

    @Mapping(target = "status", ignore = true)
    public void updateUserAccountResponse(@MappingTarget UserAccountResponse userAccountResponse, User user);
}
