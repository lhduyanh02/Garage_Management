package com.lhduyanh.garagemanagement.mapper;

import com.lhduyanh.garagemanagement.dto.request.RoleCreationRequest;
import com.lhduyanh.garagemanagement.dto.response.RoleSimpleResponse;
import com.lhduyanh.garagemanagement.dto.response.RoleResponse;
import com.lhduyanh.garagemanagement.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    @Mapping(target = "permissions", ignore = true)
    Role toRole(RoleCreationRequest roleCreationRequest);

    @Mapping(target = "permissions", source = "permissions")
    RoleResponse toRoleResponse(Role role);

    RoleSimpleResponse toRoleSimpleResponse(Role role);
}
