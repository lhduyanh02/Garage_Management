package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.CommonParameterCreationRequest;
import com.lhduyanh.garagemanagement.dto.request.CommonParameterEditRequest;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.CommonParameterResponse;
import com.lhduyanh.garagemanagement.service.CommonParameterService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/common-param")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CommonParameterController {

    private static final Logger log = LoggerFactory.getLogger(CommonParameterController.class);
    CommonParameterService service;

    @GetMapping("/{key}")
    public ApiResponse<CommonParameterResponse> getParamByKey(@PathVariable String key) {
        return ApiResponse.<CommonParameterResponse>builder()
                .code(1000)
                .data(service.getCommonParameterByKey(key))
                .build();
    }

    @PostMapping("/list-param")
    public ApiResponse<List<CommonParameterResponse>> getParamByListKey(@RequestBody List<String> keys) {
        log.info(keys.toString());
        return ApiResponse.<List<CommonParameterResponse>>builder()
                .code(1000)
                .data(service.getCommonParameterByListKey(keys))
                .build();
    }

    @GetMapping
    public ApiResponse<CommonParameterResponse> getParamById(@RequestParam("id") String id) {
        return ApiResponse.<CommonParameterResponse>builder()
                .code(1000)
                .data(service.getCommonParameterById(id))
                .build();
    }

    @GetMapping("all-param")
    public ApiResponse<List<CommonParameterResponse>> getAllParam() {
        return ApiResponse.<List<CommonParameterResponse>>builder()
                .code(1000)
                .data(service.getAllCommonParameter())
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<List<CommonParameterResponse>> updateParameter(@PathVariable String id,
                                                                      @RequestBody @Valid CommonParameterEditRequest request) {
        return ApiResponse.<List<CommonParameterResponse>>builder()
                .code(1000)
                .data(service.editCommonParameter(id, request))
                .build();
    }

    @PostMapping
    public ApiResponse<List<CommonParameterResponse>> newParam(@RequestBody @Valid CommonParameterCreationRequest request) {
        return ApiResponse.<List<CommonParameterResponse>>builder()
                .code(1000)
                .data(service.newParam(request))
                .build();
    }

}
