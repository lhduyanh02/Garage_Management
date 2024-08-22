package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.entity.Address;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.repository.AddressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AddressService {
    @Autowired
    AddressRepository addressRepository;

    public List<Address> findAll() {
        return addressRepository.findAll();
    }

    public Address findById(int id) {
        Optional<Address> address = addressRepository.findById(id);
        if(address.isPresent()) {
            return address.get();
        }
        else throw new AppException(ErrorCode.ADDRESS_NOT_EXISTED);
    }
}
