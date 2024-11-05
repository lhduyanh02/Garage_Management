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
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import static com.lhduyanh.garagemanagement.configuration.SecurityExpression.getUUIDFromJwt;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
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
                .filter(car -> car.getStatus() != CarStatus.DELETED.getCode())
                .map(carMapper::toCarResponse)
                .sorted(Comparator.comparing(CarResponse::getCreateAt).reversed())
                .toList();
    }

    public List<CarResponse> getAllMyManagedCar() {
        String uid = getUUIDFromJwt();
        return carRepository.findAllByManager(uid)
                .stream()
                .filter(c -> c.getStatus() == CarStatus.USING.getCode())
                .map(carMapper::toCarResponse)
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

    public List<CarResponse> searchCars(String partialNumPlate, String plateTypeId, String brandId, String modelId) {
        String numPlate = null;
        if (partialNumPlate != null && !partialNumPlate.trim().isEmpty()) {
            numPlate = partialNumPlate.trim().toUpperCase().replaceAll("[^A-Za-z0-9]", "");
        }

        Integer plateType = (plateTypeId != null && !plateTypeId.trim().isEmpty())
                ? Integer.valueOf(plateTypeId.trim())
                : null;

        Integer brand = (brandId != null && !brandId.trim().isEmpty())
                ? Integer.valueOf(brandId.trim())
                : null;

        Integer model = (modelId != null && !modelId.trim().isEmpty())
                ? Integer.valueOf(modelId.trim())
                : null;

        // Kiểm tra nếu tất cả tham số đều null hoặc rỗng
        if (numPlate == null && plateType == null && brand == null && model == null) {
            throw new AppException(ErrorCode.INVALID_SEARCH_CRITERIA);
        }

        List<CarResponse> cars = carRepository.searchCars(numPlate, plateType, brand, model)
                .stream()
                .filter(c -> c.getStatus() == CarStatus.USING.getCode())
                .map(carMapper::toCarResponse)
                .toList();

        if (cars.isEmpty()) {
            throw new AppException(ErrorCode.NO_CARS_FOUND);
        }
        return cars;
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
                .filter(pt -> pt.getStatus() == PlateTypeStatus.USING.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.PLATE_TYPE_NOT_EXISTS));

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
                .filter(c -> c.getStatus() != CarStatus.DELETED.getCode())
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

    public CarResponse customerUpdateCar(String id, CarRequest request) {
        String uid = getUUIDFromJwt();

        Car car = carRepository.findById(id)
                .filter(c -> c.getStatus() != CarStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_EXISTS));

        boolean hasManaged = carRepository.findAllByManager(uid)
                .stream()
                .anyMatch(c -> c.getId().equals(car.getId()));

        if (!hasManaged) {
            throw new AppException(ErrorCode.USER_NOT_MANAGE_CAR);
        }

        car.setColor(request.getColor());
        car.setCarDetail(request.getCarDetail());
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
