package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.ServiceCreationRequest;
import com.lhduyanh.garagemanagement.dto.request.ServiceUpdateRequest;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.ServiceResponse;
import com.lhduyanh.garagemanagement.dto.response.ServiceSimpleResponse;
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

    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_SERVICES', 'EDIT_SERVICE'})")
    @GetMapping("/all") // Lấy danh sách tất cả dịch vụ mà không có giá, options
    public ApiResponse<List<ServiceSimpleResponse>> getAllServices() {
        return ApiResponse.<List<ServiceSimpleResponse>>builder()
                .code(1000)
                .data(servicesService.getAllServices())
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_SERVICES', 'EDIT_SERVICE'})")
    @GetMapping("/all-with-price")
    public ApiResponse<List<ServiceResponse>> getAllServicesWithPrice() {
        return ApiResponse.<List<ServiceResponse>>builder()
                .code(1000)
                .data(servicesService.getAllServicesWithPrice())
                .build();
    }

    @GetMapping("/enable-with-price")
    public ApiResponse<List<ServiceResponse>> getAllEnableServicesWithPrice() {
        return ApiResponse.<List<ServiceResponse>>builder()
                .code(1000)
                .data(servicesService.getAllEnableServicesWithPrice())
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'ADD_SERVICE'})")
    @PostMapping
    public ApiResponse<ServiceResponse> newService(@RequestBody @Valid ServiceCreationRequest request) {
        return ApiResponse.<ServiceResponse>builder()
                .code(1000)
                .data(servicesService.newService(request, false))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'ADD_SERVICE'})")
    @PostMapping("/confirm")
    public ApiResponse<ServiceResponse> newConfirmedService(@RequestBody @Valid ServiceCreationRequest request) {
        return ApiResponse.<ServiceResponse>builder()
                .code(1000)
                .data(servicesService.newService(request, true))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'EDIT_SERVICE'})")
    @PutMapping("/{id}")
    public ApiResponse<ServiceResponse> updateService(@PathVariable String id,
                                                            @RequestBody @Valid ServiceUpdateRequest request) {
        return ApiResponse.<ServiceResponse>builder()
                .code(1000)
                .data(servicesService.updateService(id, request, false))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'EDIT_SERVICE'})")
    @PutMapping("/confirm/{id}")
    public ApiResponse<ServiceResponse> confirmUpdateService(@PathVariable String id,
                                                      @RequestBody @Valid ServiceUpdateRequest request) {
        return ApiResponse.<ServiceResponse>builder()
                .code(1000)
                .data(servicesService.updateService(id, request, true))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'DELETE_SERVICE'})")
    @DeleteMapping("/{id}")
    public ApiResponse<Boolean> deleteService(@PathVariable String id) {
        return ApiResponse.<Boolean>builder()
                .code(1000).
                data(servicesService.deleteService(id))
                .build();
    }


    @PreAuthorize("@securityExpression.hasPermission({'EDIT_SERVICE'})")
    @PutMapping("/enable/{id}")
    public ApiResponse<Boolean> enableService(@PathVariable String id) {
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .data(servicesService.enableService(id))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'EDIT_SERVICE'})")
    @PutMapping("/disable/{id}")
    public ApiResponse<Boolean> unableService(@PathVariable String id) {
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .data(servicesService.disableService(id))
                .build();
    }

}
