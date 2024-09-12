package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.request.PlateTypeRequest;
import com.lhduyanh.garagemanagement.dto.response.PlateTypeResponse;
import com.lhduyanh.garagemanagement.entity.PlateType;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.mapper.PlateTypeMapper;
import com.lhduyanh.garagemanagement.repository.PlateTypeRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PlateTypeService {

    PlateTypeRepository plateTypeRepository;
    PlateTypeMapper plateTypeMapper;

    public List<PlateTypeResponse> getAllEnablePlateTypes() {
        return plateTypeRepository.findAllByStatus(1)
                .stream()
                .map(plateTypeMapper::toPlateTypeResponse)
                .toList();
    }

    public List<PlateTypeResponse> getAllPlateTypes() {
        return plateTypeRepository.findAll()
                .stream()
                .map(plateTypeMapper::toPlateTypeResponse)
                .toList();
    }

    public PlateTypeResponse getPlateTypeById(int id) {
        return plateTypeMapper.toPlateTypeResponse(plateTypeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PLATE_TYPE_NOT_EXISTS)));
    }

    public PlateTypeResponse newPlateType(PlateTypeRequest request) {
        if (plateTypeRepository.existsByType(request.getType())) {
            throw new AppException(ErrorCode.PLATE_TYPE_EXISTED);
        }
        return plateTypeMapper.toPlateTypeResponse(plateTypeRepository.save(
                plateTypeMapper.toPlateType(request)
        ));
    }

    public PlateTypeResponse updatePlateType(int id, PlateTypeRequest request) {
        PlateType plateType = plateTypeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PLATE_TYPE_NOT_EXISTS));

        if (plateTypeRepository.existsByType(request.getType())) {
            throw new AppException(ErrorCode.PLATE_TYPE_EXISTED);
        }

        plateType.setType(request.getType());
        plateType.setStatus(request.getStatus());

        return plateTypeMapper.toPlateTypeResponse(plateTypeRepository.save(plateType));
    }

    public void unablePlateType(int id) {
        PlateType plateType = plateTypeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PLATE_TYPE_NOT_EXISTS));
        plateType.setStatus(0);
        plateTypeRepository.save(plateType);
    }

    public void enablePlateType(int id) {
        PlateType plateType = plateTypeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PLATE_TYPE_NOT_EXISTS));
        plateType.setStatus(1);
        plateTypeRepository.save(plateType);
    }
}
