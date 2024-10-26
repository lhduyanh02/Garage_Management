package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.DetailHistoryRequest;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.HistoryWithDetailsResponse;
import com.lhduyanh.garagemanagement.service.DetailHistoryService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@RequestMapping("/detail")
public class DetailHistoryController {

    DetailHistoryService detailHistoryService;

    @PostMapping("/{id}")
    public ApiResponse<HistoryWithDetailsResponse> updateListDetailHistory(@PathVariable String id,
                                                                           @RequestBody @Valid List<DetailHistoryRequest> request) {
        return ApiResponse.<HistoryWithDetailsResponse>builder()
                .code(1000)
                .data(detailHistoryService.updateListDetailHistory(id, request))
                .build();
    }

    @PutMapping("/clear-details/{id}")
    public ApiResponse<HistoryWithDetailsResponse> clearDetailHistory(@PathVariable String id) {
        return ApiResponse.<HistoryWithDetailsResponse>builder()
                .code(1000)
                .data(detailHistoryService.deleteAllDetailsByHistoryId(id))
                .build();
    }

    @DeleteMapping
    public ApiResponse<HistoryWithDetailsResponse> deleteDetailFromHistory(@RequestParam String history,
                                                                           @RequestParam String detail) {
        return ApiResponse.<HistoryWithDetailsResponse>builder()
                .code(1000)
                .data(detailHistoryService.deleteDetailFromHistory(history, detail))
                .build();
    }

}
