package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.DetailHistoryCreation;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.DetailHistoryResponse;
import com.lhduyanh.garagemanagement.service.DetailHistoryService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@RequestMapping("/detail")
public class DetailHistoryController {

    DetailHistoryService detailHistoryService;

    @PostMapping
    public ApiResponse<DetailHistoryResponse> newDetailHistory(@RequestBody @Valid DetailHistoryCreation request) {
        return ApiResponse.<DetailHistoryResponse>builder()
                .code(1000)
                .data(detailHistoryService.newDetailHistory(request))
                .build();
    }

}
