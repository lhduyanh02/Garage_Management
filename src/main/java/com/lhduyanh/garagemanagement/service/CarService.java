package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.request.CarRequest;
import com.lhduyanh.garagemanagement.dto.response.CarResponse;
import com.lhduyanh.garagemanagement.entity.Car;
import com.lhduyanh.garagemanagement.entity.Model;
import com.lhduyanh.garagemanagement.entity.PlateType;
import com.lhduyanh.garagemanagement.enums.CarStatus;
import com.lhduyanh.garagemanagement.enums.PlateTypeStatus;
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
import java.util.Comparator;
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
        return carRepository.findAll()
                .stream()
                .filter(car -> car.getStatus() == CarStatus.NOT_USE.getCode() || car.getStatus() == CarStatus.USING.getCode())
                .map(carMapper::toCarResponse)
                .sorted(Comparator.comparing(CarResponse::getCreateAt).reversed())
                .toList();
    }

    public List<CarResponse> getAllEnableCar() {
        return carRepository.findAllByStatus(CarStatus.USING.getCode())
                .stream()
                .map(carMapper::toCarResponse)
                .toList();
    }

    public List<CarResponse> getAllDeletedCar() {
        return carRepository.findAllByStatus(CarStatus.DELETED.getCode())
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

        if (request.getNumPlate().matches(".*[\\u00C0-\\u1EF9].*")) { // Kiểm tra ký tự tiếng Việt
            throw new AppException(ErrorCode.ILLEGAL_NUM_PLATE);
        }

        request.setNumPlate(request.getNumPlate().trim().toUpperCase().replaceAll("[^A-Za-z0-9]", ""));

        List<Car> checkCars = carRepository.findByNumPlateAndPlateTypeId(request.getNumPlate(), request.getPlateType())
                .stream()
                .filter(c -> c.getStatus() != CarStatus.DELETED.getCode())
                .toList();
        if (checkCars.size() > 0) {
            throw new AppException(ErrorCode.CAR_EXISTED);
        }

        PlateType plateType = plateTypeRepository.findById(request.getPlateType())
                .orElseThrow(() -> new AppException(ErrorCode.PLATE_TYPE_NOT_EXISTS));
        if (plateType.getStatus() == PlateTypeStatus.NOT_USE.getCode()) {
            throw new AppException(ErrorCode.PLATE_TYPE_NOT_EXISTS);
        }

        Model model = modelRepository.findById(request.getModel())
                .orElseThrow(() -> new AppException(ErrorCode.MODEL_NOT_EXISTS));

        Car car = carMapper.toCar(request);
        car.setPlateType(plateType);
        car.setModel(model);
        car.setStatus(CarStatus.USING.getCode());
        car.setCreateAt(LocalDateTime.now());

        return carMapper.toCarResponse(carRepository.save(car));
    }

    public CarResponse updateCar(String id, CarRequest request) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_EXISTS));

        if (request.getNumPlate().matches(".*[\\u00C0-\\u1EF9].*")) { // Kiểm tra ký tự tiếng Việt
            throw new AppException(ErrorCode.ILLEGAL_NUM_PLATE);
        }

        request.setNumPlate(request.getNumPlate().trim().toUpperCase().replaceAll("[^A-Za-z0-9]", ""));

        List<Car> checkCars = carRepository.findByNumPlateAndPlateTypeId(request.getNumPlate(), request.getPlateType())
                .stream()
                .filter(c -> (c.getStatus() != CarStatus.DELETED.getCode() && !c.getId().equals(car.getId())))
                .toList();
        if (checkCars.size() > 0) {
            throw new AppException(ErrorCode.CAR_EXISTED);
        }

        PlateType plateType = plateTypeRepository.findById(request.getPlateType())
                .orElseThrow(() -> new AppException(ErrorCode.PLATE_TYPE_NOT_EXISTS));
        if (plateType.getStatus() == PlateTypeStatus.NOT_USE.getCode()) {
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

        car.setStatus(CarStatus.DELETED.getCode());
        carRepository.save(car);
    }

    public boolean disableCar(String id) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_EXISTS));

        // check xe có đang làm dịch vụ hay không, nếu có 1 history đang có trạng thái là 0 thì từ chối

        car.setStatus(CarStatus.NOT_USE.getCode());
        carRepository.save(car);
        return true;
    }

    public boolean enableCar(String id) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_EXISTS));

        car.setStatus(CarStatus.USING.getCode());
        carRepository.save(car);
        return true;
    }

}
