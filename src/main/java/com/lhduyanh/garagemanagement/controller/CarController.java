package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.CarRequest;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.CarResponse;
import com.lhduyanh.garagemanagement.service.CarService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/cars")
public class CarController {

    CarService carService;

    @PreAuthorize("@securityExpression.hasPermission({'MAP_USER_CAR', 'EDIT_CAR', 'ADD_CAR', 'DEL_CAR', 'GET_ALL_HISTORY', 'UPLOAD_IMAGE', 'SIGN_SERVICE'})")
    @GetMapping
    public ApiResponse<List<CarResponse>> getAllEnableCars() {
        return ApiResponse.<List<CarResponse>>builder()
                .code(1000)
                .data(carService.getAllEnableCar())
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_CAR', 'EDIT_CAR', 'DEL_CAR', 'ADD_CAR'})")
    @GetMapping("/all")
    public ApiResponse<List<CarResponse>> getAllCar() {
        return ApiResponse.<List<CarResponse>>builder()
                .code(1000)
                .data(carService.getAllCar())
                .build();
    }

    @GetMapping("/my-cars")
    public ApiResponse<List<CarResponse>> getAllManagedCar() {
        return ApiResponse.<List<CarResponse>>builder()
                .code(1000)
                .data(carService.getAllMyManagedCar())
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'DEL_CAR'})")
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

    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_CAR', 'EDIT_CAR', 'ADD_CAR', 'SIGN_SERVICE', 'GET_ALL_HISTORY', 'UPLOAD_IMAGE'})")
    @GetMapping("/search")
    public ApiResponse<List<CarResponse>> searchCars(@RequestParam(required = false) String plate,
                                                     @RequestParam(required = false) String plateType,
                                                     @RequestParam(required = false) String brand,
                                                     @RequestParam(required = false) String model) {
        return ApiResponse.<List<CarResponse>>builder()
                .code(1000)
                .data(carService.searchCars(plate, plateType, brand, model))
                .build();
    }

    @GetMapping("/get-quantity")
    public ApiResponse<Long> getCarQuantity() {
    return ApiResponse.<Long>builder()
            .code(1000)
            .data(carService.getCarQuantity())
            .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'ADD_CAR', 'SIGN_SERVICE'})")
    @PostMapping
    public ApiResponse<CarResponse> newCar(@RequestBody @Valid CarRequest carRequest) {
        return ApiResponse.<CarResponse>builder()
                .code(1000)
                .data(carService.newCar(carRequest))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'EDIT_CAR'})")
    @PutMapping("/disable/{id}")
    public ApiResponse<Boolean> disableCar(@PathVariable String id) {
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .data(carService.disableCar(id))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'EDIT_CAR'})")
    @PutMapping("/enable/{id}")
    public ApiResponse<Boolean> enableCar(@PathVariable String id) {
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .data(carService.enableCar(id))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'EDIT_CAR'})")
    @PutMapping("/{id}")
    public ApiResponse<CarResponse> updateCar(@PathVariable("id") String id,
                                              @RequestBody @Valid CarRequest request) {
        return ApiResponse.<CarResponse>builder()
                .code(1000)
                .data(carService.updateCar(id, request))
                .build();
    }

    @PutMapping("customer-update/{id}")
    public ApiResponse<CarResponse> customerUpdateCar(@PathVariable("id") String id,
                                              @RequestBody @Valid CarRequest request) {
        return ApiResponse.<CarResponse>builder()
                .code(1000)
                .data(carService.customerUpdateCar(id, request))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'DEL_CAR'})")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteCar(@PathVariable String id) {
        carService.deteleCar(id);
        return ApiResponse.<Void>builder()
                .code(1000)
                .build();
    }

}
