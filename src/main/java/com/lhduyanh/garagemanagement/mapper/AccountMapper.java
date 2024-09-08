package com.lhduyanh.garagemanagement.mapper;

import com.lhduyanh.garagemanagement.dto.request.UserRegisterRequest;
import com.lhduyanh.garagemanagement.dto.request.UserAccountCreationReq;
import com.lhduyanh.garagemanagement.dto.response.AccountResponse;
import com.lhduyanh.garagemanagement.dto.response.UserAccountResponse;
import com.lhduyanh.garagemanagement.dto.response.UserRegisterResponse;
import com.lhduyanh.garagemanagement.entity.Account;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface AccountMapper {
    public AccountResponse toAccountResponse(Account account);

    @Mapping(source = "email", target = "email")
    @Mapping(source = "status", target = "status")
    public Account userAccountReqToAccount(UserAccountCreationReq userAccountCreationReq);

    @Mapping(source = "email", target = "email")
    public Account toAccount(UserRegisterRequest request);

    @Mapping(target = "status", source = "status")
    @Mapping(target = "id", ignore = true)
    public void toUserRegisterResponse(@MappingTarget UserRegisterResponse response, Account account);

    @Mapping(target = "status", source = "status")
    @Mapping(target = "id", ignore = true)
    public void toUserAccountResponse(@MappingTarget UserAccountResponse userAccountResponse, Account account);
}
