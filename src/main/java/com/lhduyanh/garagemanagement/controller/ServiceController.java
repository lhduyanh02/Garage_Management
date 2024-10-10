package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.ServiceCreationRequest;
import com.lhduyanh.garagemanagement.dto.request.ServiceUpdateRequest;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.PriceResponse;
import com.lhduyanh.garagemanagement.dto.response.ServiceResponse;
import com.lhduyanh.garagemanagement.dto.response.ServiceSimpleResponse;
import com.lhduyanh.garagemanagement.service.PriceService;
import com.lhduyanh.garagemanagement.service.ServicesService;
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
@RequestMapping("/services")
public class ServiceController {

    ServicesService servicesService;
    PriceService priceService;

    @GetMapping("/{id}")
    public ApiResponse<ServiceResponse> getServiceById(@PathVariable String id) {
        return ApiResponse.<ServiceResponse>builder()
                .code(1000)
                .data(servicesService.getServiceById(id))
                .build();
    }

    @GetMapping
    public ApiResponse<List<ServiceSimpleResponse>> getAllEnableServices() {
        return ApiResponse.<List<ServiceSimpleResponse>>builder()
                .code(1000)
                .data(servicesService.getAllEnableServices())
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_SERVICES)'})")
    @GetMapping("/all")
    public ApiResponse<List<ServiceSimpleResponse>> getAllServices() {
        return ApiResponse.<List<ServiceSimpleResponse>>builder()
                .code(1000)
                .data(servicesService.getAllServices())
                .build();
    }

    @GetMapping("/all-with-price")
    public ApiResponse<List<ServiceResponse>> getAllServicesWithPrice() {
        return ApiResponse.<List<ServiceResponse>>builder()
                .code(1000)
                .data(servicesService.getAllServicesWithPrice())
                .build();
    }

    @PostMapping
    public ApiResponse<ServiceResponse> newService(@RequestBody @Valid ServiceCreationRequest request) {
        return ApiResponse.<ServiceResponse>builder()
                .code(1000)
                .data(servicesService.newService(request, false))
                .build();
    }

    @PostMapping("/confirm")
    public ApiResponse<ServiceResponse> newConfirmedService(@RequestBody @Valid ServiceCreationRequest request) {
        return ApiResponse.<ServiceResponse>builder()
                .code(1000)
                .data(servicesService.newService(request, true))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<ServiceResponse> updateService(@PathVariable String id,
                                                            @RequestBody @Valid ServiceUpdateRequest request) {
        return ApiResponse.<ServiceResponse>builder()
                .code(1000)
                .data(servicesService.updateService(id, request, false))
                .build();
    }

    @PutMapping("/confirm/{id}")
    public ApiResponse<ServiceResponse> confirmUpdateService(@PathVariable String id,
                                                      @RequestBody @Valid ServiceUpdateRequest request) {
        return ApiResponse.<ServiceResponse>builder()
                .code(1000)
                .data(servicesService.updateService(id, request, true))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteService(@PathVariable String id) {
        servicesService.deleteService(id);
        return ApiResponse.<Void>builder()
                .code(1000)
                .build();
    }

    @PutMapping("/enable/{id}")
    public ApiResponse<Boolean> enableService(@PathVariable String id) {
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .data(servicesService.enableService(id))
                .build();
    }

    @PutMapping("/disable/{id}")
    public ApiResponse<Boolean> unableService(@PathVariable String id) {
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .data(servicesService.disableService(id))
                .build();
    }

}
