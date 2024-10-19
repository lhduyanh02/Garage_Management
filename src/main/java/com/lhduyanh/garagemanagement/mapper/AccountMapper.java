package com.lhduyanh.garagemanagement.mapper;

import com.lhduyanh.garagemanagement.dto.request.UserRegisterRequest;
import com.lhduyanh.garagemanagement.dto.request.UserAccountCreationReq;
import com.lhduyanh.garagemanagement.dto.response.*;
import com.lhduyanh.garagemanagement.entity.Account;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AccountMapper {
    AccountResponse toAccountResponse(Account account);

    AccountFullResponse toAccountFullResponse(Account account);

    AccountSimpleResponse toAccountSimpleResponse(Account account);

    @Mapping(source = "email", target = "email")
    @Mapping(source = "status", target = "status")
    Account userAccountReqToAccount(UserAccountCreationReq userAccountCreationReq);

    @Mapping(source = "email", target = "email")
    Account toAccount(UserRegisterRequest request);

    @Mapping(target = "status", source = "status")
    @Mapping(target = "id", ignore = true)
    void toUserRegisterResponse(@MappingTarget UserRegisterResponse response, Account account);

    @Mapping(target = "status", source = "status")
    @Mapping(target = "id", ignore = true)
    void toUserAccountResponse(@MappingTarget UserAccountResponse userAccountResponse, Account account);
}

