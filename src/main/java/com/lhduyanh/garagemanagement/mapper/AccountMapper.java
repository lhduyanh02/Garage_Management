package com.lhduyanh.garagemanagement.mapper;

import com.lhduyanh.garagemanagement.dto.request.UserAccountCreationReq;
import com.lhduyanh.garagemanagement.dto.response.AccountResponse;
import com.lhduyanh.garagemanagement.dto.response.UserAccountResponse;
import com.lhduyanh.garagemanagement.entity.Account;
import com.lhduyanh.garagemanagement.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface AccountMapper {
    public AccountResponse toAccountResponse(Account account);

    @Mapping(source = "email", target = "email")
    @Mapping(source = "password", target = "password")
    @Mapping(source = "status", target = "status")
    public Account userAccountReqToAccount(UserAccountCreationReq userAccountCreationReq);

    @Mapping(target = "status", source = "status")
    public void updateUserAccountResponse(@MappingTarget UserAccountResponse userAccountResponse, Account account);
}

