package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.ModelRequest;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.ModelResponse;
import com.lhduyanh.garagemanagement.service.ModelService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@RequestMapping("/models")
public class ModelController {

    ModelService modelService;

    @GetMapping
    public ApiResponse<List<ModelResponse>> getAllModels() {
        return ApiResponse.<List<ModelResponse>>builder()
                .code(1000)
                .data(modelService.getAllModel())
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<ModelResponse> getModelById(@PathVariable int id) {
        return ApiResponse.<ModelResponse>builder()
                .code(1000)
                .data(modelService.getModelById(id))
                .build();
    }
    
    @PutMapping
    public ApiResponse<ModelResponse> updateModel(@RequestParam("id") int id, @RequestBody ModelRequest request) {
        return ApiResponse.<ModelResponse>builder()
                .code(1000)
                .data(modelService.updateModel(id, request))
                .build();
    }
}
