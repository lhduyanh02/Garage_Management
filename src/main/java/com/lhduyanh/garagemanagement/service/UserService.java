package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.request.UserCreationRequest;
import com.lhduyanh.garagemanagement.dto.response.UserResponse;
import com.lhduyanh.garagemanagement.entity.User;
import com.lhduyanh.garagemanagement.entity.Address;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.mapper.UserMapper;
import com.lhduyanh.garagemanagement.repository.AddressRepository;
import com.lhduyanh.garagemanagement.repository.UserRepository;
import lombok.AccessLevel;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Data
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserService {
    UserRepository userRepository;
    AddressRepository addressRepository;
    UserMapper userMapper;

    public List<UserResponse> getAllUserWithAddress(){
        List<User> users = userRepository.findAllWithAddress();

        return users.stream()
                .map(userMapper::toUserResponse)
                .collect(Collectors.toList());
    };

    public User createUser(UserCreationRequest request){

//        if (userRepository.existsByEmail(request.getEmail())){
//            throw new AppException(ErrorCode.USER_EXISTED);
//        }

        Address address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new RuntimeException("Address not found"));

        User user = userMapper.toUser(request);

        user.setAddress(address);

        return userRepository.save(user);
    }
}
