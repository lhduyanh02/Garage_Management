package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.HistoryCreationRequest;
import com.lhduyanh.garagemanagement.dto.request.HistoryUserUpdate;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.HistoryResponse;
import com.lhduyanh.garagemanagement.dto.response.HistoryWithDetailsResponse;
import com.lhduyanh.garagemanagement.service.HistoryService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/history")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class HistoryController {

    HistoryService historyService;

    @GetMapping("/get-by-car/{id}")
    public ApiResponse<List<HistoryResponse>> getAllHistoryByCarId(@PathVariable String id) {
        return ApiResponse.<List<HistoryResponse>>builder()
                .code(1000)
                .data(historyService.getAllHistoryByCarId(id))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<HistoryWithDetailsResponse> getHistoryById(@PathVariable String id) {
        return ApiResponse.<HistoryWithDetailsResponse>builder()
                .code(1000)
                .data(historyService.getHistoryById(id))
                .build();
    }

    @PostMapping("/new-history")
    public ApiResponse<HistoryResponse> newHistory(@RequestBody @Valid HistoryCreationRequest request) {
        return ApiResponse.<HistoryResponse>builder()
                .code(1000)
                .data(historyService.newHistory(request))
                .build();
    }

    @PutMapping("/update-customer")
    public ApiResponse<HistoryResponse> updateCustomer(@RequestBody @Valid HistoryUserUpdate request) {
        return ApiResponse.<HistoryResponse>builder()
                .code(1000)
                .data(historyService.updateCustomer(request))
                .build();
    }


}
