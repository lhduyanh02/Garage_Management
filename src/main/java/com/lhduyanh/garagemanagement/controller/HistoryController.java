package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.HistoryCreationRequest;
import com.lhduyanh.garagemanagement.dto.request.HistoryInfoUpdateRequest;
import com.lhduyanh.garagemanagement.dto.request.HistoryUserUpdate;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.HistoryResponse;
import com.lhduyanh.garagemanagement.dto.response.HistoryWithDetailsResponse;
import com.lhduyanh.garagemanagement.service.HistoryService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/history")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class HistoryController {

    HistoryService historyService;

    @PreAuthorize("@securityExpression.hasPermission({'SIGN_SERVICE', 'UPLOAD_IMAGE', 'GET_ALL_HISTORY'})")
    @GetMapping("/get-by-car/{id}")
    public ApiResponse<List<HistoryResponse>> getAllHistoryByCarId(@PathVariable String id) {
        return ApiResponse.<List<HistoryResponse>>builder()
                .code(1000)
                .data(historyService.getAllHistoryByCarId(id))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'SIGN_SERVICE', 'UPLOAD_IMAGE', 'GET_ALL_HISTORY', 'STATISTICS'})")
    @GetMapping("/{id}")
    public ApiResponse<HistoryWithDetailsResponse> getHistoryById(@PathVariable String id) {
        return ApiResponse.<HistoryWithDetailsResponse>builder()
                .code(1000)
                .data(historyService.getHistoryById(id))
                .build();
    }

    @GetMapping("/customer/get-by-car/{id}")
    public ApiResponse<List<HistoryResponse>> customerGetAllHistoryByCarId(@PathVariable String id) {
        return ApiResponse.<List<HistoryResponse>>builder()
                .code(1000)
                .data(historyService.customerGetAllHistoryByCarId(id))
                .build();
    }

    @GetMapping("/customer/get-detail/{id}")
    public ApiResponse<HistoryWithDetailsResponse> customerGetHistoryById(@PathVariable String id) {
        return ApiResponse.<HistoryWithDetailsResponse>builder()
                .code(1000)
                .data(historyService.customerGetHistoryById(id))
                .build();
    }

    @GetMapping("/get-quantity")
    public ApiResponse<Long> getHistoryQuantity() {
        return ApiResponse.<Long>builder()
                .code(1000)
                .data(historyService.getHistoryQuantity())
                .build();
    }


    @PreAuthorize("@securityExpression.hasPermission({'STATISTICS'})")
    @GetMapping("/all-history-by-time-range")
    public ApiResponse<List<HistoryResponse>> getAllHistoryByTimeRange(@RequestParam("start") LocalDateTime start,
                                                                       @RequestParam("end") LocalDateTime end,
                                                                       @RequestParam(value = "status", required = false) Integer status) {
        return ApiResponse.<List<HistoryResponse>>builder()
                .code(1000)
                .data(historyService.getAllHistoryByTimeRange(start, end, status))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'SIGN_SERVICE', 'UPLOAD_IMAGE', 'GET_ALL_HISTORY'})")
    @GetMapping("/get-all-proceeding")
    public ApiResponse<List<HistoryResponse>> getAllProceedingHistory() {
        return ApiResponse.<List<HistoryResponse>>builder()
                .code(1000)
                .data(historyService.getAllProceedingHistory())
                .build();
    }


    // POST REQUEST

    @PreAuthorize("@securityExpression.hasPermission({'SIGN_SERVICE'})")
    @PostMapping("/new-history")
    public ApiResponse<HistoryResponse> newHistory(@RequestBody @Valid HistoryCreationRequest request) {
        return ApiResponse.<HistoryResponse>builder()
                .code(1000)
                .data(historyService.newHistory(request))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'SIGN_SERVICE'})")
    @PutMapping("/update-customer")
    public ApiResponse<HistoryResponse> updateCustomer(@RequestBody @Valid HistoryUserUpdate request) {
        return ApiResponse.<HistoryResponse>builder()
                .code(1000)
                .data(historyService.updateCustomer(request))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'EDIT_USER', 'SIGN_SERVICE'})")
    @PutMapping("/update-info/{id}")
    public ApiResponse<HistoryWithDetailsResponse> updateInfo(@PathVariable String id,
                                                              @RequestBody @Valid HistoryInfoUpdateRequest request) {
        return ApiResponse.<HistoryWithDetailsResponse>builder()
                .code(1000)
                .data(historyService.updateHistoryInfo(id, request))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'SIGN_SERVICE'})")
    @PutMapping("/done/{id}")
    public ApiResponse<HistoryWithDetailsResponse> doneHistory(@PathVariable String id) {
        return ApiResponse.<HistoryWithDetailsResponse>builder()
                .code(1000)
                .data(historyService.closeHistory(id, true))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'SIGN_SERVICE'})")
    @PutMapping("/cancel/{id}")
    public ApiResponse<HistoryWithDetailsResponse> cancelHistory(@PathVariable String id) {
        return ApiResponse.<HistoryWithDetailsResponse>builder()
                .code(1000)
                .data(historyService.closeHistory(id, false))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'DELETE_HISTORY'})")
    @DeleteMapping("/delete-history/{id}")
    public ApiResponse<Boolean> deleteHistory(@PathVariable String id) {
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .data(historyService.deleteHistory(id))
                .build();
    }

}
