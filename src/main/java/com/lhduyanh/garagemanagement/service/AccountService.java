package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.request.AccountVerifyRequest;
import com.lhduyanh.garagemanagement.dto.request.UserRegisterRequest;
import com.lhduyanh.garagemanagement.dto.request.UserAccountCreationReq;
import com.lhduyanh.garagemanagement.dto.response.AccountResponse;
import com.lhduyanh.garagemanagement.dto.response.AccountVerifyResponse;
import com.lhduyanh.garagemanagement.dto.response.UserAccountResponse;
import com.lhduyanh.garagemanagement.dto.response.UserRegisterResponse;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

import static java.util.Objects.isNull;
import static java.util.Objects.requireNonNull;

@RequiredArgsConstructor
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AccountService {
    AccountRepository accountRepository;
    AccountMapper accountMapper;
    UserMapper userMapper;
    UserRepository userRepository;
    AddressRepository addressRepository;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;
    private final OtpService otpService;

    @NonFinal
    @Value("${app.password-strength}")
    int strength;

    public AccountResponse getAccountById(String id) {
        return accountMapper.toAccountResponse(accountRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXISTED)));
    }

    public List<AccountResponse> getAllAccounts() {
        return accountRepository.findAll()
                .stream()
                .map(accountMapper::toAccountResponse)
                .toList();
    }

    // Create user-account with default role: CUSTOMER
    public UserAccountResponse createUserAccount(UserAccountCreationReq userAccountCreationReq) {

        boolean existed = accountRepository.existsByEmail(userAccountCreationReq.getEmail());
        if(existed) {
            throw new AppException(ErrorCode.ACCOUNT_EXISTED);
        }
        userAccountCreationReq.setName(userAccountCreationReq.getName().trim());
        if (userAccountCreationReq.getPhone() != null) {
            // Xóa ký tự khoảng trắng , . -
            userAccountCreationReq.setPhone(userAccountCreationReq.getPhone()
                    .replaceAll("[,\\.\\-\\s]", ""));
        }

        User user = userMapper.UserAccountReqToUser(userAccountCreationReq);

        Optional<Address> address = Optional.of(userAccountCreationReq.getAddressId())
                .flatMap(addressRepository::findById);
        if(address.isPresent()) {
            user.setAddress(address.get());
        }

        Set<Role> roles = new HashSet<>();
        if(isNull(userAccountCreationReq.getRoleIds()) || userAccountCreationReq.getRoleIds().isEmpty()){
            roles.add(roleRepository.findByRoleKey("CUSTOMER").get());
        } else {
            roles = new HashSet<>(roleRepository.findAllById(userAccountCreationReq.getRoleIds()));
        }
        user.setRoles(roles);
        user.setStatus(0);                                                                                            
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
        userMapper.toUserAccountResponse(userAccountResponse, user);
        accountMapper.toUserAccountResponse(userAccountResponse, account);
        return userAccountResponse;
    }

    // User register with only role: CUSTOMER
    public UserRegisterResponse accountRegister(UserRegisterRequest request){
        var acc = accountRepository.findByEmail(request.getEmail());
        if(acc.isPresent()) {
            if (acc.get().getStatus() == 0) {
                if (Duration.between(acc.get().getGeneratedAt(), LocalDateTime.now()).toMinutes() < 1){
                    throw new AppException(ErrorCode.OTP_SEND_TIMER);
                }
                accountRepository.delete(acc.get());
            }
            else if (acc.get().getStatus() == 1){
                throw new AppException(ErrorCode.ACCOUNT_EXISTED);
            }
        }

        request.setEmail(request.getEmail().trim());
        if (request.getPhone() != null) {
            // Xóa ký tự khoảng trắng , . -
            request.setPhone(request.getPhone().replaceAll("[,\\.\\-\\s]", ""));
        }

        User user = userMapper.toUser(request);
        Optional<Address> address = Optional.of(request.getAddressId())
                .flatMap(addressRepository::findById);
        if(address.isPresent()) {
            user.setAddress(address.get());
        }
        Set<Role> roles = new HashSet<>();
        roles.add(roleRepository.findByRoleKey("CUSTOMER").get());
        user.setRoles(roles);
        user.setStatus(0);
        try {
            user = userRepository.save(user);
        }
        catch(Exception e) {
            log.error("\n\nERROR IN USER REGISTER PROGRESS\n\n");
            log.error(e.getMessage());
        }

        Account account = accountMapper.toAccount(request);
        account.setUser(user);
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setStatus(0);

        account = otpService.createSendOtpCode(account);
        account = accountRepository.save(account);

        UserRegisterResponse userRegisterResponse = new UserRegisterResponse();
        userMapper.toUserRegisterResponse(userRegisterResponse, user);
        accountMapper.toUserRegisterResponse(userRegisterResponse, account);
        return userRegisterResponse;
    }

    public AccountVerifyResponse accountVerify (AccountVerifyRequest request) {
        boolean result = otpService.VerifyOtpCode(request.getEmail(), request.getOtpCode());
        if (result) {
            Account account = accountRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXISTED));
            if (account.getStatus() == 0) // Chỉ xác thực cho account có status = 0
                account.setStatus(1);
            accountRepository.save(account);

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
            if (user.getStatus() == 0) // Chỉ xác thực cho user có status = 0
                user.setStatus(1);
            userRepository.save(user);
            return AccountVerifyResponse.builder().result(true).build();
        }
        return AccountVerifyResponse.builder().result(false).build();
    }

    public void regenerateOtpCode(String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXISTED));

        // Kiểm tra cách 1 phút kể từ lần gửi email trước
        if((account.getStatus() >= 0) && (Duration.between(account.getGeneratedAt(), LocalDateTime.now()).toMinutes() > 1)) {
            otpService.createSendOtpCode(account);
        }
        else {
            throw new AppException(ErrorCode.CANNOT_REGENERATE_OTP);
        }
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

}
