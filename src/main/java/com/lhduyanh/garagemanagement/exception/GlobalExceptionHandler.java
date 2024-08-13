package com.lhduyanh.garagemanagement.exception;

import com.lhduyanh.garagemanagement.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponse> handleAppException(AppException exception) {
        ApiResponse apiResponse = new ApiResponse();

        ErrorCode errorCode = exception.getErrorCode();
        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(errorCode.getMessage());

        return ResponseEntity.badRequest().body(apiResponse);
    }

    @ExceptionHandler(value = RuntimeException.class)
    ResponseEntity<ApiResponse<String>>handleRuntimeException(RuntimeException exception) {
        ApiResponse<String> apiResponse = new ApiResponse<>();
        apiResponse.setMessage(exception.getMessage());
        apiResponse.setCode(9999);
        return ResponseEntity.badRequest().body(apiResponse);
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse<String>>handleMethodArgumentNotValidException( MethodArgumentNotValidException exception) {
        ApiResponse<String> apiResponse = new ApiResponse<>();
        apiResponse.setMessage(exception.getFieldError().getDefaultMessage());
        apiResponse.setCode(400);
        return ResponseEntity.badRequest().body(apiResponse);
    }

}
