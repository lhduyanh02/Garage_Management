package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.request.ModelRequest;
import com.lhduyanh.garagemanagement.dto.response.BrandModelResponse;
import com.lhduyanh.garagemanagement.dto.response.ModelResponse;
import com.lhduyanh.garagemanagement.entity.Brand;
import com.lhduyanh.garagemanagement.entity.Model;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.mapper.ModelMapper;
import com.lhduyanh.garagemanagement.repository.BrandRepository;
import com.lhduyanh.garagemanagement.repository.ModelRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ModelService {

    ModelRepository modelRepository;
    ModelMapper modelMapper;
    BrandRepository brandRepository;

    public List<ModelResponse> getAllModel() {
        return modelRepository.findAll()
                .stream()
                .map(modelMapper::toModelResponse)
                .toList();
    }

    public ModelResponse getModelById(int id) {
        return modelMapper.toModelResponse(modelRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MODEL_NOT_EXISTS)));
    }

    public ModelResponse newModel(ModelRequest request) {
        if (modelRepository.existsByModel(request.getModel())){
            throw new AppException(ErrorCode.MODEL_NAME_EXISTED);
        }

        if(request.getBrand() == 0)
            throw new AppException(ErrorCode.BLANK_BRAND);

        Brand brand = brandRepository.findById(request.getBrand())
                .orElseThrow(() -> new AppException(ErrorCode.BRAND_NOT_EXISTS));

        Model model = modelMapper.toModel(request);
        model.setBrand(brand);
        return modelMapper.toModelResponse(modelRepository.save(model));
    }

    public ModelResponse updateModel(int id, ModelRequest request) {
        if (modelRepository.existsByModel(request.getModel())){
            throw new AppException(ErrorCode.MODEL_NAME_EXISTED);
        }
        Model model = modelRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MODEL_NOT_EXISTS));

        model.setModel(request.getModel());
        return modelMapper.toModelResponse(modelRepository.save(model));
    }
}
