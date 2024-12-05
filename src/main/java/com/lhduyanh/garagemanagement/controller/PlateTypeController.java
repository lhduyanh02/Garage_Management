package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.PlateTypeRequest;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.PlateTypeFullResponse;
import com.lhduyanh.garagemanagement.dto.response.PlateTypeResponse;
import com.lhduyanh.garagemanagement.service.PlateTypeService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/plate-types")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PlateTypeController {

    PlateTypeService plateTypeService;

    @GetMapping
    public ApiResponse<List<PlateTypeResponse>> getAllEnablePlateTypes(){
        return ApiResponse.<List<PlateTypeResponse>>builder()
                .code(1000)
                .data(plateTypeService.getAllEnablePlateTypes())
                .build();
    }

    @Transactional
    @PreAuthorize("@securityExpression.hasPermission({'EDIT_MODEL_LIST'})")
    @GetMapping("/all")
    public ApiResponse<List<PlateTypeFullResponse>> getAllPlateTypes(){
        return ApiResponse.<List<PlateTypeFullResponse>>builder()
                .code(1000)
                .data(plateTypeService.getAllPlateTypes())
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<PlateTypeResponse> getPlateTypeById(@PathVariable int id){
        return ApiResponse.<PlateTypeResponse>builder()
                .code(1000)
                .data(plateTypeService.getPlateTypeById(id))
                .build();
    }

    @PostMapping
    @PreAuthorize("@securityExpression.hasPermission({'EDIT_MODEL_LIST'})")
    public ApiResponse<PlateTypeResponse> newPlateType(@RequestBody @Valid PlateTypeRequest request) {
        return ApiResponse.<PlateTypeResponse>builder()
                .code(1000)
                .data(plateTypeService.newPlateType(request))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<PlateTypeResponse> updatePlateType(@PathVariable int id,
                                                          @RequestBody @Valid PlateTypeRequest request) {
        return ApiResponse.<PlateTypeResponse>builder()
                .code(1000)
                .data(plateTypeService.updatePlateType(id, request))
                .build();
    }

    @PutMapping("/disable/{id}")
    @PreAuthorize("@securityExpression.hasPermission({'EDIT_MODEL_LIST'})")
    public ApiResponse<Void> disablePlateType(@PathVariable int id) {
        plateTypeService.disablePlateType(id);
        return ApiResponse.<Void>builder()
                .code(1000)
                .build();
    }

    @PutMapping("/enable/{id}")
    @PreAuthorize("@securityExpression.hasPermission({'EDIT_MODEL_LIST'})")
    public ApiResponse<Void> enablePlateType(@PathVariable int id) {
        plateTypeService.enablePlateType(id);
        return ApiResponse.<Void>builder()
                .code(1000)
                .build();
    }
}
