package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.request.CommonParameterCreationRequest;
import com.lhduyanh.garagemanagement.dto.request.CommonParameterEditRequest;
import com.lhduyanh.garagemanagement.dto.response.CommonParameterResponse;
import com.lhduyanh.garagemanagement.entity.CommonParameter;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.mapper.CommonParameterMapper;
import com.lhduyanh.garagemanagement.repository.CommonParameterRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CommonParameterService {

    CommonParameterRepository commonParameterRepository;

    CommonParameterMapper commonParameterMapper;

    public List<CommonParameterResponse> getAllCommonParameter(){
        return commonParameterRepository.findAll()
                .stream()
                .map(commonParameterMapper::toResponse)
                .sorted(Comparator.comparing(CommonParameterResponse::getKey))
                .toList();
    }

    public List<CommonParameterResponse> editCommonParameter(String id, CommonParameterEditRequest request) {
        CommonParameter parameter = commonParameterRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PARAMETER_NOT_EXIST));

        if (request.getValue() == null || request.getValue().isBlank()) {
            throw new AppException(ErrorCode.BLANK_VALUE);
        }

        parameter.setValue(request.getValue());
        commonParameterRepository.save(parameter);
        return getAllCommonParameter();
    }

    public CommonParameterResponse getCommonParameterById(String id) {
        return commonParameterRepository.findById(id)
                .map(commonParameterMapper::toResponse)
                .orElseThrow(() -> new AppException(ErrorCode.PARAMETER_NOT_EXIST));
    }

    public CommonParameterResponse getCommonParameterByKey(String paramKey) {
        return commonParameterRepository.findByKey(paramKey)
                .map(commonParameterMapper::toResponse)
                .orElseThrow(() -> new AppException(ErrorCode.PARAMETER_NOT_EXIST));
    }

    public List<CommonParameterResponse> getCommonParameterByListKey(List<String> keys) {
        List<CommonParameterResponse> params = new ArrayList<>();

        for (String key : keys) {
            if (key == null && key.trim().equals("")){
                throw new AppException(ErrorCode.BLANK_KEY);
            }
            CommonParameter param = commonParameterRepository.findByKey(key)
                    .orElseThrow(() -> new AppException(ErrorCode.PARAMETER_NOT_EXIST));
            params.add(commonParameterMapper.toResponse(param));
        }

        return params;
    }

    public List<CommonParameterResponse> newParam(CommonParameterCreationRequest request) {
        CommonParameter parameter = commonParameterMapper.toCommonParameter(request);
        commonParameterRepository.save(parameter);
        return getAllCommonParameter();
    }
}
