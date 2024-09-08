package com.lhduyanh.garagemanagement.mapper;

import com.lhduyanh.garagemanagement.dto.request.PermissionRequest;
import com.lhduyanh.garagemanagement.dto.response.PermissionResponse;
import com.lhduyanh.garagemanagement.entity.Permissions;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PermissionMapper {

    @Mapping(target = "function", ignore = true)
    public Permissions toPermissions(PermissionRequest request);

    public PermissionResponse toPermissionResponse(Permissions permissions);

}