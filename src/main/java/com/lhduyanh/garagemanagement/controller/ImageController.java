package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.ImageUploadRequest;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.ImageResponse;
import com.lhduyanh.garagemanagement.dto.response.ImageStatisticsResponse;
import com.lhduyanh.garagemanagement.service.ImageService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.repository.query.Param;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/service-images")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ImageController {

    ImageService imageService;

    @GetMapping("/pre-service/{id}")
    public ApiResponse<List<ImageResponse>> getPreServiceImagesByHistoryId (@PathVariable String id) {
        return ApiResponse.<List<ImageResponse>>builder()
                .code(1000)
                .data(imageService.getServiceImageByHistoryId(id, true))
                .build();
    }

    @GetMapping("/post-service/{id}")
    public ApiResponse<List<ImageResponse>> getPostServiceImagesByHistoryId (@PathVariable String id) {
        return ApiResponse.<List<ImageResponse>>builder()
                .code(1000)
                .data(imageService.getServiceImageByHistoryId(id, false))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'CLEAN_MEMORY'})")
    @GetMapping("/statistics/pre-service")
    public ApiResponse<ImageStatisticsResponse> getPreServiceImageStatistics(@RequestParam("start") LocalDateTime start,
                                                                             @RequestParam("end") LocalDateTime end) {
        return ApiResponse.<ImageStatisticsResponse>builder()
                .code(1000)
                .data(imageService.getImageStatisticsByTimeRange(start, end, true))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'CLEAN_MEMORY'})")
    @GetMapping("/statistics/post-service")
    public ApiResponse<ImageStatisticsResponse> getPostServiceImageStatistics(@RequestParam("start") LocalDateTime start,
                                                                             @RequestParam("end") LocalDateTime end) {
        return ApiResponse.<ImageStatisticsResponse>builder()
                .code(1000)
                .data(imageService.getImageStatisticsByTimeRange(start, end, false))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'UPLOAD_IMAGE', 'SIGN_SERVICE'})")
    @PostMapping("/pre-service/{id}")
    public ApiResponse<List<ImageResponse>> addMorePreServiceImagesByHistoryId (@PathVariable String id,
                                                                                @RequestBody List<@Valid ImageUploadRequest> request) {
        return ApiResponse.<List<ImageResponse>>builder()
                .code(1000)
                .data(imageService.addMoreServiceImage(id, request, true))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'UPLOAD_IMAGE', 'SIGN_SERVICE'})")
    @PostMapping("/post-service/{id}")
    public ApiResponse<List<ImageResponse>> addMorePostServiceImagesByHistoryId (@PathVariable String id,
                                                                                @RequestBody List<@Valid ImageUploadRequest> request) {
        return ApiResponse.<List<ImageResponse>>builder()
                .code(1000)
                .data(imageService.addMoreServiceImage(id, request, false))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'UPLOAD_IMAGE', 'SIGN_SERVICE'})")
    @PutMapping("/update-pre-service/{id}")
    public ApiResponse<List<ImageResponse>> updatePreServiceImagesByHistoryId (@PathVariable String id,
                                                                               @RequestBody List<@Valid ImageUploadRequest> request) {
        return ApiResponse.<List<ImageResponse>>builder()
                .code(1000)
                .data(imageService.updateServiceImageList(id, request, true))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'UPLOAD_IMAGE', 'SIGN_SERVICE'})")
    @PutMapping("/update-post-service/{id}")
    public ApiResponse<List<ImageResponse>> updatePostServiceImagesByHistoryId (@PathVariable String id,
                                                                               @RequestBody List<@Valid ImageUploadRequest> request) {
        return ApiResponse.<List<ImageResponse>>builder()
                .code(1000)
                .data(imageService.updateServiceImageList(id, request, false))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'UPLOAD_IMAGE', 'SIGN_SERVICE'})")
    @DeleteMapping("/pre-service/{id}")
    public ApiResponse<Boolean> deletePreServiceImagesByHistoryId (@PathVariable String id) {
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .data(imageService.deleteAllImagesByHistoryId(id, true))
                .build();
    }

    @PreAuthorize("@securityExpression.hasPermission({'UPLOAD_IMAGE', 'SIGN_SERVICE'})")
    @DeleteMapping("/post-service/{id}")
    public ApiResponse<Boolean> deletePostServiceImagesByHistoryId (@PathVariable String id) {
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .data(imageService.deleteAllImagesByHistoryId(id, false))
                .build();
    }

    @DeleteMapping("/clear-pre-service-image")
    public ApiResponse<Boolean> clearPreServiceImage(@RequestParam("start") LocalDateTime startDate,
                                           @RequestParam("end") LocalDateTime endDate) {
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .data(imageService.clearImageByTimeRange(startDate, endDate, true))
                .build();
    }

    @DeleteMapping("/clear-post-service-image")
    public ApiResponse<Boolean> clearPostServiceImage(@RequestParam("start") LocalDateTime startDate,
                                           @RequestParam("end") LocalDateTime endDate) {
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .data(imageService.clearImageByTimeRange(startDate, endDate, false))
                .build();
    }

}
