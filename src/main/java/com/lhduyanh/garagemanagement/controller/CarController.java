package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.CarRequest;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.CarResponse;
import com.lhduyanh.garagemanagement.service.CarService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/cars")
public class CarController {

    CarService carService;

    @GetMapping
    public ApiResponse<List<CarResponse>> getAllEnableCars() {
        return ApiResponse.<List<CarResponse>>builder()
                .code(1000)
                .data(carService.getAllEnableCar())
                .build();
    }

    @GetMapping("/all")
    public ApiResponse<List<CarResponse>> getAllCar() {
        return ApiResponse.<List<CarResponse>>builder()
                .code(1000)
                .data(carService.getAllCar())
                .build();
    }

    @GetMapping("/deleted")
    public ApiResponse<List<CarResponse>> getAllDeletedCar() {
        return ApiResponse.<List<CarResponse>>builder()
                .code(1000)
                .data(carService.getAllDeletedCar())
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<CarResponse> getCarById(@PathVariable String id) {
        return ApiResponse.<CarResponse>builder()
                .code(1000)
                .data(carService.getCarById(id))
                .build();
    }

    @PostMapping
    public ApiResponse<CarResponse> newCar(@RequestBody @Valid CarRequest carRequest) {
        return ApiResponse.<CarResponse>builder()
                .code(1000)
                .data(carService.newCar(carRequest))
                .build();
    }

    @PutMapping
    public ApiResponse<CarResponse> updateCar(@RequestParam("id") String id,
                                              @RequestBody @Valid CarRequest request) {
        return ApiResponse.<CarResponse>builder()
                .code(1000)
                .data(carService.updateCar(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteCar(@PathVariable String id) {
        carService.deteleCar(id);
        return ApiResponse.<Void>builder()
                .code(1000)
                .build();
    }

}
