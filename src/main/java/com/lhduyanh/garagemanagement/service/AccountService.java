package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.request.UserAccountCreationReq;
import com.lhduyanh.garagemanagement.dto.response.AccountResponse;
import com.lhduyanh.garagemanagement.dto.response.UserAccountResponse;
import com.lhduyanh.garagemanagement.entity.Account;
import com.lhduyanh.garagemanagement.entity.Address;
import com.lhduyanh.garagemanagement.entity.Role;
import com.lhduyanh.garagemanagement.entity.User;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.mapper.AccountMapper;
import com.lhduyanh.garagemanagement.mapper.UserMapper;
import com.lhduyanh.garagemanagement.repository.AccountRepository;
import com.lhduyanh.garagemanagement.repository.AddressRepository;
import com.lhduyanh.garagemanagement.repository.RoleRepository;
import com.lhduyanh.garagemanagement.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@RequiredArgsConstructor
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AccountService {
    AccountRepository accountRepository;
    AccountMapper accountMapper;
    UserMapper userMapper;
    UserRepository userRepository;
    AddressRepository addressRepository;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;

    @NonFinal
    @Value("${app.password-strength}")
    int strength;

    public AccountResponse getAccountById(String id) {
        return accountMapper.toAccountResponse(accountRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXISTED)));
    }

    public List<AccountResponse> getAllAccounts() {
        return accountRepository.findAll().stream().map(accountMapper::toAccountResponse).toList();
    }

    // Create user-account with default role: CUSTOMER
    public UserAccountResponse createUserAccount(UserAccountCreationReq userAccountCreationReq) {

        boolean existed = accountRepository.existsByEmail(userAccountCreationReq.getEmail());

        if(existed) {
            throw new AppException(ErrorCode.ACCOUNT_EXISTED);
        }

        userAccountCreationReq.setName(userAccountCreationReq.getName().trim());
        userAccountCreationReq.setPhone(userAccountCreationReq.getPhone().replaceAll("\\s", ""));

        User user = userMapper.UserAccountReqToUser(userAccountCreationReq);

        Optional<Address> address = Optional.ofNullable(userAccountCreationReq.getAddressId())
                .flatMap(addressRepository::findById);

        if(address.isPresent()) {
            user.setAddress(address.get());
        }

        Set<Role> roles = new HashSet<>();

        if(userAccountCreationReq.getRoleIds().isEmpty()){
            roles.add(roleRepository.findByRoleKey("CUSTOMER").get());
        } else {
            roles = new HashSet<>(roleRepository.findAllById(userAccountCreationReq.getRoleIds()));
        }

        user.setRoles(roles);

        try {
            user = userRepository.save(user);
        }
        catch(Exception e) {
            e.printStackTrace();
        }

        Account account = accountMapper.userAccountReqToAccount(userAccountCreationReq);
        account.setUser(user);

        account.setPassword(passwordEncoder.encode(userAccountCreationReq.getPassword()));
        account = accountRepository.save(account);

        UserAccountResponse userAccountResponse = new UserAccountResponse();
        userMapper.updateUserAccountResponse(userAccountResponse, user);
        accountMapper.updateUserAccountResponse(userAccountResponse, account);

        return userAccountResponse;
    }




//    public AccountResponse createAccount(AccountCreationRequest request) {
//
//        // Check if account existed
//        boolean b = accountRepository.existsByEmail(request.getEmail());
//        if (b) {
//            throw new AppException(ErrorCode.ACCOUNT_EXISTED);
//        }
//
//        Optional<User> user = userRepository.findByEmailStatus1(email);
//        if (user.isPresent()) {
//            // hashing password and save new account
//
//        }
//
//    }

    // Generate OTP Code inside class
    private String generateOtp() {
        Random random = new Random();
        int randomInt = random.nextInt(999999);
        String otpCode = String.valueOf(randomInt);
        while (otpCode.length() < 6) {
            otpCode = "0" + otpCode;
        }

        return otpCode;
    }

/*
    public Account createAccount(AccountCreationRequest request){
        Account account = new Account();

        if(accountRepository.existsByEmail(request.getEmail())){
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        account.setEmail(request.getEmail());
        account.setPassword(request.getPassword());
        account.setHo(request.getHo());
        account.setTen(request.getTen());
        account.setNgaysinh(request.getNgaysinh());
        account.setSdt(request.getSdt());

        return accountRepository.save(account);
    }

    public List<Account> getAllAccounts(){
        return accountRepository.findAll();
    }

    public Account getAccountById(String id){
        Optional<Account> acc = accountRepository.findById(id);
        if(acc.isPresent()){
            return acc.get();
        }
        else {
            throw new AppException(ErrorCode.ACCOUNT_NOT_EXISTED);
        }
    }

    public boolean updateStatusByEmail(String email, int status){
        int result = accountRepository.updateStatusByEmail(email, status);
        return result > 0;
    }

    public int deleteAccountById(String id){
        Optional<Account> acc = accountRepository.findById(id);
        if(acc.isPresent()){
            accountRepository.deleteById(id);
            return 1;
        }
        else {
            return -1;
        }
    }

 */
}
