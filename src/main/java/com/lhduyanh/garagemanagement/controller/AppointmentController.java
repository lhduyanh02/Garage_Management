package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.AppointmentCreationRequest;
import com.lhduyanh.garagemanagement.dto.request.AppointmentUpdateRequest;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.AppointmentResponse;
import com.lhduyanh.garagemanagement.service.AppointmentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/appointment")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AppointmentController {

    AppointmentService appointmentService;

    @GetMapping("/{id}")
    public ApiResponse<AppointmentResponse> getAppointmentById(@PathVariable String id) {
        return ApiResponse.<AppointmentResponse>builder()
                .code(1000)
                .data(appointmentService.getAppointmentById(id))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_APPOINTMENT'})")
    @GetMapping
    public ApiResponse<List<AppointmentResponse>> getAllAppointments() {
        return ApiResponse.<List<AppointmentResponse>>builder()
                .code(1000)
                .data(appointmentService.getAllAppointments())
                .build();
    }

    @GetMapping("/customer")
    public ApiResponse<List<AppointmentResponse>> getAllAppointments(@RequestParam(value = "customer", required = false) String customerId, @RequestParam(value = "sorter", required = false) Boolean sorter) {
        return ApiResponse.<List<AppointmentResponse>>builder()
                .code(1000)
                .data(appointmentService.getAllAppointmentByCustomerId(customerId, sorter))
                .build();
    }


    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_APPOINTMENT', 'STAFF_BOOKING'})")
    @GetMapping("/by-time")
    public ApiResponse<List<AppointmentResponse>> getAllAppointmentsByTimeRange(@RequestParam LocalDateTime start, @RequestParam LocalDateTime end) {
        return ApiResponse.<List<AppointmentResponse>>builder()
                .code(1000)
                .data(appointmentService.getAllAppointmentsByTimeRange(start, end))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'GET_ALL_APPOINTMENT', 'STAFF_BOOKING'})")
    @GetMapping("/by-create-time")
    public ApiResponse<List<AppointmentResponse>> getAllAppointmentsByCreateTimeRange(@RequestParam LocalDateTime start, @RequestParam LocalDateTime end) {
        return ApiResponse.<List<AppointmentResponse>>builder()
                .code(1000)
                .data(appointmentService.getAllAppointmentsByCreateTimeRange(start, end))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'STAFF_BOOKING'})")
    @PostMapping
    public ApiResponse<AppointmentResponse> newAppointmentByStaff(@RequestBody AppointmentCreationRequest request) {
        return ApiResponse.<AppointmentResponse>builder()
                .code(1000)
                .data(appointmentService.newAppointmentByStaff(request))
                .build();
    }

    @PostMapping("/customer-booking")
    public ApiResponse<AppointmentResponse> newAppointmentByCustomer(@RequestBody AppointmentCreationRequest request) {
        return ApiResponse.<AppointmentResponse>builder()
                .code(1000)
                .data(appointmentService.newAppointmentByCustomer(request))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'EDIT_APPOINTMENT'})")
    @PutMapping("/update-status")
    public ApiResponse<Boolean> staffUpdateAppointmentStatus(@RequestParam("appointment") String id, @RequestParam("status") int status) {
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .data(appointmentService.updateAppointmentStatus(id, status))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'EDIT_APPOINTMENT'})")
    @PutMapping("/staff-update/{id}")
    public ApiResponse<AppointmentResponse> updateAppointmentByStaff(@PathVariable String id, @RequestBody AppointmentUpdateRequest request) {
        return ApiResponse.<AppointmentResponse>builder()
                .code(1000)
                .data(appointmentService.updateAppointment(id, request, true))
                .build();
    }

    @PutMapping("/customer-update/{id}")
    public ApiResponse<AppointmentResponse> updateAppointmentByCustomer(@PathVariable String id, @RequestBody AppointmentUpdateRequest request) {
        return ApiResponse.<AppointmentResponse>builder()
                .code(1000)
                .data(appointmentService.updateAppointment(id, request, false))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteAppointment(@PathVariable String id) {
        appointmentService.deleteappointment(id);
        return ApiResponse.<Void>builder()
                .code(1000)
                .build();
    }

}
