package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.ModelRequest;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.ModelResponse;
import com.lhduyanh.garagemanagement.service.ModelService;
import jakarta.validation.Valid;
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
    
    @PutMapping("/{id}")
    public ApiResponse<ModelResponse> updateModel(@PathVariable("id") int id, @RequestBody @Valid ModelRequest request) {
        return ApiResponse.<ModelResponse>builder()
                .code(1000)
                .data(modelService.updateModel(id, request))
                .build();
    }

    @PostMapping
    public ApiResponse<ModelResponse> newBrand(@RequestBody @Valid ModelRequest request) {
        return ApiResponse.<ModelResponse>builder()
                .code(1000)
                .data(modelService.newModel(request))
                .build();
    }
}
