package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.PlateTypeRequest;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.PlateTypeResponse;
import com.lhduyanh.garagemanagement.service.PlateTypeService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
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

    @GetMapping("/all")
    public ApiResponse<List<PlateTypeResponse>> getAllPlateTypes(){
        return ApiResponse.<List<PlateTypeResponse>>builder()
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

    @PutMapping
    public ApiResponse<PlateTypeResponse> updatePlateType(@RequestParam int id,
                        @RequestBody @Valid PlateTypeRequest request) {
        return ApiResponse.<PlateTypeResponse>builder()
                .code(1000)
                .data(plateTypeService.updatePlateType(id, request))
                .build();
    }

    @PostMapping
    public ApiResponse<PlateTypeResponse> newPlateType(@RequestBody @Valid PlateTypeRequest request) {
        return ApiResponse.<PlateTypeResponse>builder()
                .code(1000)
                .data(plateTypeService.newPlateType(request))
                .build();
    }

    @PutMapping("/unable")
    public ApiResponse<Void> unablePlateType(@RequestParam int id) {
        plateTypeService.unablePlateType(id);
        return ApiResponse.<Void>builder()
                .code(1000)
                .build();
    }

    @PutMapping("/enable")
    public ApiResponse<Void> enablePlateType(@RequestParam int id) {
        plateTypeService.enablePlateType(id);
        return ApiResponse.<Void>builder()
                .code(1000)
                .build();
    }
}
