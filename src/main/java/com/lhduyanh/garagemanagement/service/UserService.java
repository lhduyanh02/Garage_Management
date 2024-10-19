package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.request.UserCarMappingRequest;
import com.lhduyanh.garagemanagement.dto.request.UserCreationRequest;
import com.lhduyanh.garagemanagement.dto.request.UserUpdateRequest;
import com.lhduyanh.garagemanagement.dto.response.*;
import com.lhduyanh.garagemanagement.entity.Account;
import com.lhduyanh.garagemanagement.entity.Car;
import com.lhduyanh.garagemanagement.entity.Role;
import com.lhduyanh.garagemanagement.entity.User;
import com.lhduyanh.garagemanagement.enums.AccountStatus;
import com.lhduyanh.garagemanagement.enums.CarStatus;
import com.lhduyanh.garagemanagement.enums.RoleStatus;
import com.lhduyanh.garagemanagement.enums.UserStatus;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.mapper.UserMapper;
import com.lhduyanh.garagemanagement.repository.*;
import lombok.AccessLevel;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Collator;
import java.util.*;
import java.util.stream.Collectors;

import static com.lhduyanh.garagemanagement.configuration.SecurityExpression.getUUIDFromJwt;
import static java.util.Objects.isNull;

@Service
@Data
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserService {
    UserRepository userRepository;
    AddressRepository addressRepository;
    AccountRepository accountRepository;
    RoleRepository roleRepository;
    UserMapper userMapper;
    CarRepository carRepository;
    private final Collator vietnameseCollator;

    public List<UserResponse> getAllUserWithAddress(){
        List<User> users = userRepository.findAllUserFullInfo();
        return users.stream()
                .map(user -> {
                    UserResponse response = userMapper.toUserResponse(user);

                    // Lọc các cars trong UserResponse dựa trên trạng thái
                    List<CarResponse> filteredCars = response.getCars().stream()
                            .filter(car -> car.getStatus()!=CarStatus.DELETED.getCode())
                            .collect(Collectors.toList());
                    response.setCars(filteredCars);

                    return response;
                })
                .sorted(Comparator.comparing(UserResponse::getName, vietnameseCollator))
                .collect(Collectors.toList());
    };

    public List<UserResponse> getAllActiveUser(){

        List<User> users = userRepository.findAllActiveUserFetchCars();
        return users.stream()
                .map(user -> {
                    UserResponse response = userMapper.toUserResponse(user);

                    // Lọc các cars trong UserResponse dựa trên trạng thái
                    List<CarResponse> filteredCars = response.getCars().stream()
                            .filter(car -> car.getStatus()!=CarStatus.DELETED.getCode())
                            .collect(Collectors.toList());
                    response.setCars(filteredCars);

                    return response;
                })
                .sorted(Comparator.comparing(UserResponse::getName, vietnameseCollator))
                .collect(Collectors.toList());
    };

    public List<UserFullResponse> getAllActiveCustomers(){
        List<User> users = userRepository.findAllActiveCustomerFullInfo();
        return users.stream()
                .map(user -> {
                    UserFullResponse response = userMapper.toUserFullResponse(user);
                    Set<RoleSimpleResponse> roles = response.getRoles()
                            .stream()
                            .filter(role -> role.getStatus()== RoleStatus.USING.getCode())
                            .collect(Collectors.toSet());
                    response.setRoles(roles);

                    List<CarResponse> cars = response.getCars().stream()
                            .filter(car -> car.getStatus() == CarStatus.USING.getCode())
                            .toList();
                    response.setCars(cars);

                    List<AccountSimpleResponse> accounts = response.getAccounts()
                            .stream()
                            .filter(account -> account.getStatus() >= AccountStatus.NOT_CONFIRM.getCode())
                            .toList();
                    response.setAccounts(accounts);

                    return response;
                })
                .sorted(Comparator.comparing(UserFullResponse::getName))
                .filter(user -> user.getRoles().size()>0)
                .collect(Collectors.toList());
    };

    public List<UserWithAccountsResponse> getAllUserWithAccounts(){
        List<User> users = userRepository.findAllWithAccounts();
        return users
                .stream().filter(user -> user.getStatus() != 9999)
                .map(userMapper::toUserWithAccountsResponse)
                .sorted(Comparator.comparing(UserWithAccountsResponse::getName, vietnameseCollator))
                .toList();
    }

    public UserFullResponse getUserById(String id){
        return userRepository.findByIdFullInfo(id)
                .filter(u -> u.getStatus() != UserStatus.DELETED.getCode())
                .map(u -> {
                    Set<Role> listRole = new HashSet<>();
                    for(Role r : u.getRoles()){
                        if(r.getStatus()==RoleStatus.USING.getCode()){
                            listRole.add(r);
                        }
                    }
                    u.setRoles(listRole);

                    Set<Account> listAccount = new HashSet<>();
                    for(Account a : u.getAccounts()){
                        if(a.getStatus()==AccountStatus.CONFIRMED.getCode()){
                            listAccount.add(a);
                        }
                    }
                    u.setAccounts(listAccount);

                    u.setCars(u.getCars().stream()
                            .filter(c -> c.getStatus() != CarStatus.DELETED.getCode())
                            .collect(Collectors.toSet()));

                    return userMapper.toUserFullResponse(u);
                })
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    public UserFullResponse getMyUserInfo(){
        var UUID = getUUIDFromJwt();
        return userRepository.findByIdFullInfo(UUID)
                .filter(u -> u.getStatus() != UserStatus.DELETED.getCode())
                .map(u -> {
                    Set<Role> listRole = new HashSet<>();
                    for(Role r : u.getRoles()){
                        if(r.getStatus()==RoleStatus.USING.getCode()){
                            listRole.add(r);
                        }
                    }
                    u.setRoles(listRole);

                    Set<Account> listAccount = new HashSet<>();
                    for(Account a : u.getAccounts()){
                        if(a.getStatus()==AccountStatus.CONFIRMED.getCode()){
                            listAccount.add(a);
                        }
                    }
                    u.setAccounts(listAccount);

                    u.setCars(u.getCars().stream()
                            .filter(c -> c.getStatus() != CarStatus.DELETED.getCode())
                            .collect(Collectors.toSet()));

                    return userMapper.toUserFullResponse(u);
                })
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    public UserResponse createUser(UserCreationRequest request){
        if (request.getPhone() != null) {
            request.setPhone(request.getPhone().replaceAll("[,\\.\\-\\s]", ""));
        }

        User user = userMapper.toUser(request);
        if(!(isNull(request.getAddressId()) || request.getAddressId() < 0)) {
            var address = addressRepository.findById(request.getAddressId());
            address.ifPresent(user::setAddress);
        }

        Set<Role> roles = new HashSet<>();
        if(isNull(request.getRoleIds()) || request.getRoleIds().isEmpty()){
            roles.add(roleRepository.findByRoleKey("CUSTOMER").get());
        } else {
            roles = new HashSet<>(roleRepository.findAllById(request.getRoleIds()));
        }
        user.setRoles(roles);

        return userMapper.toUserResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateUser(String userId, UserUpdateRequest request){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (request.getPhone() != null) {
            // Xóa ký tự khoảng trắng , . -
            request.setPhone(request.getPhone().replaceAll("[,\\.\\-\\s]", ""));
            if(request.getPhone().length()<6) {
                throw new AppException(ErrorCode.INVALID_PHONE_NUMBER);
            }
        };

        userMapper.updateUser(user, request);

        if(!(request.getAddressId() <= 0)) {
            var address = addressRepository.findById(request.getAddressId());
            address.ifPresent(addr -> {
                user.setAddress(addr);
            });
        } else {
            user.setAddress(null);
        }

        Set<Role> roles = new HashSet<>();
        if(isNull(request.getRoleIds()) || request.getRoleIds().isEmpty()){
            roles.add(roleRepository.findByRoleKey("CUSTOMER").get());
        } else {
            roles = new HashSet<>(roleRepository.findAllById(request.getRoleIds()));
        }
        user.setRoles(roles);

        UserResponse response = userMapper.toUserResponse(userRepository.save(user));

        // Lọc các cars trong UserResponse dựa trên trạng thái
        List<CarResponse> filteredCars = response.getCars().stream()
                .filter(car -> car.getStatus()!=CarStatus.DELETED.getCode())
                .collect(Collectors.toList());
        response.setCars(filteredCars);

        return response;
    }

    public void deleteUserById(String id) {
        var user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (user.getStatus() != UserStatus.NOT_CONFIRM.getCode()){
            throw new AppException(ErrorCode.DELETE_ACTIVATED_USER);
        }

        var account = accountRepository.findByUserId(user.getId());
        account.ifPresent(accountRepository::delete);

        userRepository.deleteById(id);
    }

    public void hardDeleteUserById(String id) {
        var user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        var account = accountRepository.findByUserId(user.getId());
        account.ifPresent(accountRepository::delete);

        userRepository.deleteById(id);
    }

    public void disableUserById(String id) {
        var user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (user.getStatus() != UserStatus.CONFIRMED.getCode() && user.getStatus() != UserStatus.NOT_CONFIRM.getCode()){
            throw new AppException(ErrorCode.DISABLE_ACTIVE_USER_ONLY);
        }

        user.setStatus(UserStatus.BLOCKED.getCode());
        userRepository.save(user);
    }

    public void activateUserById(String id) {
        var user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        user.setStatus(UserStatus.CONFIRMED.getCode());
        userRepository.save(user);
    }

//    @Transactional
    public boolean userCarMapping(UserCarMappingRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if(user.getStatus() != UserStatus.CONFIRMED.getCode()) {
            throw new AppException(ErrorCode.DISABLED_USER);
        }

        Car car = carRepository.findById(request.getCarId())
                .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_EXISTS));
        if(car.getStatus() != CarStatus.USING.getCode()) {
            throw new AppException(ErrorCode.   DISABLED_CAR);
        }
        Set<Car> carSet = user.getCars();
        if(!carSet.contains(car)) {
            carSet.add(car);
            user.setCars(carSet);
        }
        userRepository.save(user);
        return true;
    }
}
