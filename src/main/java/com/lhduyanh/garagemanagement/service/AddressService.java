package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.response.AddressResponse;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.mapper.AddressMapper;
import com.lhduyanh.garagemanagement.repository.AddressRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AddressService {
    AddressRepository addressRepository;
    AddressMapper addressMapper;

    public List<AddressResponse> findAll() {
        return addressRepository.findAll()
                .stream()
                .map(addressMapper::toAddressResponse)
                .toList();
    }

    public AddressResponse findById(int id) {
        return addressMapper.toAddressResponse(addressRepository.findById(id)
                .orElseThrow(() -> new AppException
                        (ErrorCode.ADDRESS_NOT_EXISTED)));
    }
}
