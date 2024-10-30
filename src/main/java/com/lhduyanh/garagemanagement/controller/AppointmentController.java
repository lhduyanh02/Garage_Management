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

    @GetMapping
    public ApiResponse<List<AppointmentResponse>> getAllAppointments() {
        return ApiResponse.<List<AppointmentResponse>>builder()
                .code(1000)
                .data(appointmentService.getAllAppointments())
                .build();
    }

    @GetMapping("/by-time")
    public ApiResponse<List<AppointmentResponse>> getAllAppointmentsByTimeRange(@RequestParam LocalDateTime start, @RequestParam LocalDateTime end) {
        return ApiResponse.<List<AppointmentResponse>>builder()
                .code(1000)
                .data(appointmentService.getAllAppointmentsByTimeRange(start, end))
                .build();
    }

    @GetMapping("/by-create-time")
    public ApiResponse<List<AppointmentResponse>> getAllAppointmentsByCreateTimeRange(@RequestParam LocalDateTime start, @RequestParam LocalDateTime end) {
        return ApiResponse.<List<AppointmentResponse>>builder()
                .code(1000)
                .data(appointmentService.getAllAppointmentsByCreateTimeRange(start, end))
                .build();
    }

    @PostMapping
    public ApiResponse<AppointmentResponse> newAppointment(@RequestBody AppointmentCreationRequest request) {
        return ApiResponse.<AppointmentResponse>builder()
                .code(1000)
                .data(appointmentService.newAppointment(request))
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

    @PutMapping("/staff-update-detail/{id}")
    public ApiResponse<AppointmentResponse> updateAppointment(@PathVariable String id, @RequestBody AppointmentUpdateRequest request) {
        return ApiResponse.<AppointmentResponse>builder()
                .code(1000)
                .data(appointmentService.updateAppointment(id, request, true))
                .build();
    }

}
