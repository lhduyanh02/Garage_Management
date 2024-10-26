package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.ImageUploadRequest;
import com.lhduyanh.garagemanagement.dto.response.ApiResponse;
import com.lhduyanh.garagemanagement.dto.response.ImageResponse;
import com.lhduyanh.garagemanagement.service.ImageService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/pre-service/{id}")
    public ApiResponse<List<ImageResponse>> addMorePreServiceImagesByHistoryId (@PathVariable String id,
                                                                                @RequestBody List<@Valid ImageUploadRequest> request) {
        return ApiResponse.<List<ImageResponse>>builder()
                .code(1000)
                .data(imageService.addMoreServiceImage(id, request, true))
                .build();
    }

    @PostMapping("/post-service/{id}")
    public ApiResponse<List<ImageResponse>> addMorePostServiceImagesByHistoryId (@PathVariable String id,
                                                                                @RequestBody List<@Valid ImageUploadRequest> request) {
        return ApiResponse.<List<ImageResponse>>builder()
                .code(1000)
                .data(imageService.addMoreServiceImage(id, request, false))
                .build();
    }

    @PutMapping("/update-pre-service/{id}")
    public ApiResponse<List<ImageResponse>> updatePreServiceImagesByHistoryId (@PathVariable String id,
                                                                               @RequestBody List<@Valid ImageUploadRequest> request) {
        return ApiResponse.<List<ImageResponse>>builder()
                .code(1000)
                .data(imageService.updateServiceImageList(id, request, true))
                .build();
    }

    @PutMapping("/update-post-service/{id}")
    public ApiResponse<List<ImageResponse>> updatePostServiceImagesByHistoryId (@PathVariable String id,
                                                                               @RequestBody List<@Valid ImageUploadRequest> request) {
        return ApiResponse.<List<ImageResponse>>builder()
                .code(1000)
                .data(imageService.updateServiceImageList(id, request, false))
                .build();
    }

    @DeleteMapping("/pre-service/{id}")
    public ApiResponse<Boolean> deletePreServiceImagesByHistoryId (@PathVariable String id) {
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .data(imageService.deleteAllImagesByHistoryId(id, true))
                .build();
    }

    @DeleteMapping("/post-service/{id}")
    public ApiResponse<Boolean> deletePostServiceImagesByHistoryId (@PathVariable String id) {
        return ApiResponse.<Boolean>builder()
                .code(1000)
                .data(imageService.deleteAllImagesByHistoryId(id, false))
                .build();
    }

}
