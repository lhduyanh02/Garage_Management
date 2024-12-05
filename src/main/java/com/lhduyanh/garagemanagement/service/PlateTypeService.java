package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.request.PlateTypeRequest;
import com.lhduyanh.garagemanagement.dto.response.PlateTypeFullResponse;
import com.lhduyanh.garagemanagement.dto.response.PlateTypeResponse;
import com.lhduyanh.garagemanagement.entity.PlateType;
import com.lhduyanh.garagemanagement.enums.PlateTypeStatus;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.mapper.PlateTypeMapper;
import com.lhduyanh.garagemanagement.repository.PlateTypeRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.text.Collator;
import java.util.Comparator;
import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class PlateTypeService {

    PlateTypeRepository plateTypeRepository;
    PlateTypeMapper plateTypeMapper;
    Collator vietnameseCollator;

    public List<PlateTypeResponse> getAllEnablePlateTypes() {
        return plateTypeRepository.findAllByStatus(PlateTypeStatus.USING.getCode())
                .stream()
                .map(plateTypeMapper::toPlateTypeResponse)
                .sorted(Comparator.comparing(PlateTypeResponse::getType, vietnameseCollator))
                .toList();
    }

    public List<PlateTypeFullResponse> getAllPlateTypes() {
        return plateTypeRepository.findAll()
                .stream()
                .filter(p -> p.getStatus() != PlateTypeStatus.DELETED.getCode())
                .map(pt -> {
                    PlateTypeFullResponse response = plateTypeMapper.toPlateTypeFullResponse(pt);
                    if (pt.getCars() != null && !pt.getCars().isEmpty()) {
                        response.setCarQuantity(pt.getCars().size());
                    }
                    else {
                        response.setCarQuantity(0);
                    }
                    return response;
                })
                .sorted(Comparator.comparing(PlateTypeFullResponse::getType, vietnameseCollator))
                .toList();
    }

    public PlateTypeResponse getPlateTypeById(int id) {
        return plateTypeMapper.toPlateTypeResponse(plateTypeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PLATE_TYPE_NOT_EXISTS)));
    }

    public PlateTypeResponse newPlateType(PlateTypeRequest request) {
        List<PlateType> checkTypes = plateTypeRepository.findAllByType(request.getType())
                .stream()
                .filter(p -> p.getStatus() != PlateTypeStatus.DELETED.getCode())
                .toList();
        if (!checkTypes.isEmpty()) {
            throw new AppException(ErrorCode.PLATE_TYPE_EXISTED);
        }

        return plateTypeMapper.toPlateTypeResponse(plateTypeRepository.save(
                plateTypeMapper.toPlateType(request)
        ));
    }

    public PlateTypeResponse updatePlateType(int id, PlateTypeRequest request) {
        PlateType plateType = plateTypeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PLATE_TYPE_NOT_EXISTS));

        List<PlateType> checkTypes = plateTypeRepository.findAllByType(request.getType())
                .stream()
                .filter(p -> p.getStatus() != PlateTypeStatus.DELETED.getCode() && p.getId() != id)
                .toList();
        if (!checkTypes.isEmpty()) {
            throw new AppException(ErrorCode.PLATE_TYPE_EXISTED);
        }

        plateType.setType(request.getType());
        plateType.setStatus(request.getStatus());

        return plateTypeMapper.toPlateTypeResponse(plateTypeRepository.save(plateType));
    }

    public void disablePlateType(int id) {
        PlateType plateType = plateTypeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PLATE_TYPE_NOT_EXISTS));
        plateType.setStatus(PlateTypeStatus.NOT_USE.getCode());
        plateTypeRepository.save(plateType);
    }

    public void enablePlateType(int id) {
        PlateType plateType = plateTypeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PLATE_TYPE_NOT_EXISTS));
        plateType.setStatus(PlateTypeStatus.USING.getCode());
        plateTypeRepository.save(plateType);
    }
}
