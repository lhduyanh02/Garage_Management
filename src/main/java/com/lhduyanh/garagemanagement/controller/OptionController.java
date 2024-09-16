package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.OptionCreationRequest;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.OptionSimpleResponse;
import com.lhduyanh.garagemanagement.service.OptionService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@RequestMapping("/options")
public class OptionController {

    OptionService optionService;

    @GetMapping
    public ApiResponse<List<OptionSimpleResponse>> getAllEnableServiceClass() {
        return ApiResponse.<List<OptionSimpleResponse>>builder()
                .code(1000)
                .data(optionService.getAllEnableOption())
                .build();
    }

    @GetMapping("/all")
    public ApiResponse<List<OptionSimpleResponse>> getAllServiceClass() {
        return ApiResponse.<List<OptionSimpleResponse>>builder()
                .code(1000)
                .data(optionService.getAllOption())
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<OptionSimpleResponse> getServiceClassById(@PathVariable String id) {
        return ApiResponse.<OptionSimpleResponse>builder()
                .code(1000)
                .data(optionService.getOptionById(id))
                .build();
    }

    @PostMapping
    public ApiResponse<OptionSimpleResponse> newServiceClass(@RequestBody @Valid OptionCreationRequest request) {
        return ApiResponse.<OptionSimpleResponse>builder()
                .code(1000)
                .data(optionService.newOption(request))
                .build();
    }

    @PutMapping("/unable")
    public ApiResponse<Void> unableServiceClass(@RequestParam String id) {
        optionService.unableOption(id);
        return ApiResponse.<Void>builder()
                .code(1000)
                .build();
    }

    @PutMapping("/enable")
    public ApiResponse<Void> enableServiceClass(@RequestParam String id) {
        optionService.enableOption(id);
        return ApiResponse.<Void>builder()
                .code(1000)
                .build();
    }

}
