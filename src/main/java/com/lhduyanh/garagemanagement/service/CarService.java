package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.request.CarRequest;
import com.lhduyanh.garagemanagement.dto.response.CarResponse;
import com.lhduyanh.garagemanagement.entity.Car;
import com.lhduyanh.garagemanagement.entity.Model;
import com.lhduyanh.garagemanagement.entity.PlateType;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.mapper.CarMapper;
import com.lhduyanh.garagemanagement.repository.CarRepository;
import com.lhduyanh.garagemanagement.repository.ModelRepository;
import com.lhduyanh.garagemanagement.repository.PlateTypeRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CarService {

    CarRepository carRepository;
    CarMapper carMapper;

    PlateTypeRepository plateTypeRepository;
    ModelRepository modelRepository;

    public CarResponse getCarById(String id) {
        return carMapper.toCarResponse(carRepository.findById(id)
            .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_EXISTS)));
    }

    public List<CarResponse> getAllCar() {
        return carRepository.findAllByStatus(1)
                .stream()
                .map(carMapper::toCarResponse)
                .toList();
    }

    public List<CarResponse> getAllDeletedCar() {
        return carRepository.findAllByStatus(-1)
                .stream()
                .map(carMapper::toCarResponse)
                .toList();
    }

    public CarResponse newCar(CarRequest request) {
        if(request.getPlateType() == 0){
            throw new AppException(ErrorCode.BLANK_PLATE_TYPE);
        }

        if(request.getModel() == 0){
            throw new AppException(ErrorCode.BLANK_MODEL);
        }

        request.setNumPlate(request.getNumPlate().trim().toUpperCase());
        if (carRepository.
                existsByNumPlateAndPlateTypeId(request.getNumPlate(), request.getPlateType())){
            throw new AppException(ErrorCode.CAR_EXISTED);
        }

        PlateType plateType = plateTypeRepository.findById(request.getPlateType())
                .orElseThrow(() -> new AppException(ErrorCode.PLATE_TYPE_NOT_EXISTS));
        if (plateType.getStatus() == 0) {
            throw new AppException(ErrorCode.PLATE_TYPE_NOT_EXISTS);
        }

        Model model = modelRepository.findById(request.getModel())
                .orElseThrow(() -> new AppException(ErrorCode.MODEL_NOT_EXISTS));

        Car car = carMapper.toCar(request);
        car.setPlateType(plateType);
        car.setModel(model);
        car.setStatus(1);
        car.setCreateAt(LocalDateTime.now());

        return carMapper.toCarResponse(carRepository.save(car));
    }

    public CarResponse updateCar(String id, CarRequest request) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_EXISTS));

        request.setNumPlate(request.getNumPlate().trim().toUpperCase());

        Optional<Car> checkCar = carRepository.findByNumPlateAndPlateTypeId(request.getNumPlate(), request.getPlateType());
        if (checkCar.isPresent() && !checkCar.get().getId().equals(car.getId())) {
            throw new AppException(ErrorCode.CAR_EXISTED);
        }

        PlateType plateType = plateTypeRepository.findById(request.getPlateType())
                .orElseThrow(() -> new AppException(ErrorCode.PLATE_TYPE_NOT_EXISTS));
        if (plateType.getStatus() == 0) {
            throw new AppException(ErrorCode.PLATE_TYPE_NOT_EXISTS);
        }
        Model model = modelRepository.findById(request.getModel())
                .orElseThrow(() -> new AppException(ErrorCode.MODEL_NOT_EXISTS));

        carMapper.updateCar(car, request);
        car.setPlateType(plateType);
        car.setModel(model);
        return carMapper.toCarResponse(carRepository.save(car));
    }

    public void deteleCar(String id) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_EXISTS));

        car.setStatus(-1);
        carRepository.save(car);
    }

}
