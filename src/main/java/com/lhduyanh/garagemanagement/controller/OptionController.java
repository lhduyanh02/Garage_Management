package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.OptionCreationRequest;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.OptionFullResponse;
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
    public ApiResponse<List<OptionSimpleResponse>> getAllEnableOption() {
        return ApiResponse.<List<OptionSimpleResponse>>builder()
                .code(1000)
                .data(optionService.getAllEnableOption())
                .build();
    }

    @GetMapping("/all")
    public ApiResponse<List<OptionSimpleResponse>> getAllOption() {
        return ApiResponse.<List<OptionSimpleResponse>>builder()
                .code(1000)
                .data(optionService.getAllOption())
                .build();
    }

    @GetMapping("/all-with-price")
    public ApiResponse<List<OptionFullResponse>> getAllOptionWithPrice() {
        return ApiResponse.<List<OptionFullResponse>>builder()
                .code(1000)
                .data(optionService.getAllOptionWithPrice())
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<OptionFullResponse> getOptionById(@PathVariable String id) {
        return ApiResponse.<OptionFullResponse>builder()
                .code(1000)
                .data(optionService.getOptionById(id))
                .build();
    }

    @PostMapping
    public ApiResponse<OptionSimpleResponse> newOption(@RequestBody @Valid OptionCreationRequest request) {
        return ApiResponse.<OptionSimpleResponse>builder()
                .code(1000)
                .data(optionService.newOption(request))
                .build();
    }

    @PutMapping("/unable")
    public ApiResponse<Void> unableOption(@RequestParam String id) {
        optionService.unableOption(id);
        return ApiResponse.<Void>builder()
                .code(1000)
                .build();
    }

    @PutMapping("/enable")
    public ApiResponse<Void> enableOption(@RequestParam String id) {
        optionService.enableOption(id);
        return ApiResponse.<Void>builder()
                .code(1000)
                .build();
    }

}
