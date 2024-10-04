package com.lhduyanh.garagemanagement.mapper;

import com.lhduyanh.garagemanagement.dto.request.UserRegisterRequest;
import com.lhduyanh.garagemanagement.dto.request.UserAccountCreationReq;
import com.lhduyanh.garagemanagement.dto.request.UserCreationRequest;
import com.lhduyanh.garagemanagement.dto.request.UserUpdateRequest;
import com.lhduyanh.garagemanagement.dto.response.UserAccountResponse;
import com.lhduyanh.garagemanagement.dto.response.UserRegisterResponse;
import com.lhduyanh.garagemanagement.dto.response.UserResponse;
import com.lhduyanh.garagemanagement.dto.response.UserWithAccountsResponse;
import com.lhduyanh.garagemanagement.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {

    User toUser(UserCreationRequest request);

    @Mapping(target = "roles", source = "roles")
    UserResponse toUserResponse(User user);

    @Mapping(target = "roles", source = "roles")
    @Mapping(target = "address", source = "address")
    @Mapping(target = "accounts", source = "accounts")
    UserWithAccountsResponse toUserWithAccountsResponse(User user);

    @Mapping(source = "name", target = "name")
    @Mapping(source = "phone", target = "phone")
    @Mapping(source = "gender", target = "gender")
    @Mapping(target = "address", ignore = true)
    User UserAccountReqToUser(UserAccountCreationReq userAccountCreationReq);

    @Mapping(source = "name", target = "name")
    @Mapping(source = "phone", target = "phone")
    @Mapping(source = "gender", target = "gender")
    @Mapping(target = "address", ignore = true)
    User toUser(UserRegisterRequest request);

    @Mapping(target = "status", ignore = true)
    @Mapping(target = "id", source = "id")
    void toUserAccountResponse(@MappingTarget UserAccountResponse userAccountResponse, User user);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "address", source = "address")
    void toUserRegisterResponse(@MappingTarget UserRegisterResponse userRegisterResponse, User user);

    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "address", ignore = true)
    void updateUser(@MappingTarget User user, UserUpdateRequest request);
}
