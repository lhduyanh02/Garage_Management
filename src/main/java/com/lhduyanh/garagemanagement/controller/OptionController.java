package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.OptionCreationRequest;
import com.lhduyanh.garagemanagement.dto.request.OptionUpdateRequest;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.OptionFullResponse;
import com.lhduyanh.garagemanagement.dto.response.OptionSimpleResponse;
import com.lhduyanh.garagemanagement.service.OptionService;
import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_OPTION'})")
    @GetMapping("/all") // Không có giá và service
    public ApiResponse<List<OptionSimpleResponse>> getAllOption() {
        return ApiResponse.<List<OptionSimpleResponse>>builder()
                .code(1000)
                .data(optionService.getAllOption())
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_OPTION'})")
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

    @PreAuthorize("@securityExpression.hasPermission({'ADD_OPTION'})")
    @PostMapping
    public ApiResponse<OptionSimpleResponse> newOption(@RequestBody @Valid OptionCreationRequest request) {
        return ApiResponse.<OptionSimpleResponse>builder()
                .code(1000)
                .data(optionService.newOption(request))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'EDIT_OPTION'})")
    @PutMapping("/disable/{id}")
    public ApiResponse<Boolean> disableOption(@PathVariable String id) {
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .data(optionService.disableOption(id))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'EDIT_OPTION'})")
    @PutMapping("/enable/{id}")
    public ApiResponse<Boolean> enableOption(@PathVariable String id) {
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .data(optionService.enableOption(id))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'EDIT_OPTION'})")
    @PutMapping("/{id}")
    public ApiResponse<OptionSimpleResponse> updateOption(@PathVariable String id,
                                                          @RequestBody @Valid OptionUpdateRequest request) {
        return ApiResponse.<OptionSimpleResponse>builder()
                .code(1000)
                .data(optionService.updateOption(id, request))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'DELETE_OPTION'})")
    @DeleteMapping("/{id}")
    public ApiResponse<Boolean> deleteOption(@PathVariable String id) {
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .data(optionService.deleteOption(id))
                .build();
    }

}
