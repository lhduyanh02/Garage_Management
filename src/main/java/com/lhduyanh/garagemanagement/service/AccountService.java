package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.request.*;
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
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

import static java.util.Objects.isNull;
import static com.lhduyanh.garagemanagement.configuration.SecurityExpression.getUUIDFromJwt;

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
    @Value("${app.admin-email}")
    String ADMIN_EMAIL;

    @NonFinal
    @Value("${app.default-password}")
    String DEFAULT_PASSWORD;


    public AccountResponse getAccountById(String id) {
        return accountMapper.toAccountResponse(accountRepository.findByIdFetchAddress(id)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXISTED)));
    }

    public List<AccountResponse> getAllAccounts() {
        return accountRepository.findAll()
                .stream()
                .map(accountMapper::toAccountResponse)
                .toList();
    }

    public List<AccountResponse> getAllEnableAccounts() {
        return accountRepository.findAllByStatus(1)
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

    @Transactional
    public AccountResponse newAccount(AccountCreationRequest request, boolean confirm) {
        Account account = new Account();
        accountRepository.findByEmail(request.getEmail().trim())
                .ifPresent(acc -> {
                    throw new AppException(ErrorCode.ACCOUNT_EXISTED);
                });
        account.setEmail(request.getEmail().trim());

        var password = DEFAULT_PASSWORD;

        if (request.getPassword() != null) {
            if (request.getPassword().get().length() < 8) {
                throw new AppException(ErrorCode.INVALID_PASSWORD);
            }
            password = passwordEncoder.encode(request.getPassword().get());
        } else {
            password = passwordEncoder.encode(DEFAULT_PASSWORD);
        }
        account.setPassword(password);

        var user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if(user.getStatus() == 9999){
            throw new AppException(ErrorCode.CAN_NOT_EDIT_ADMIN);
        }

        List<Account> accounts = accountRepository.findAllByUserId(request.getUserId());
        if (!accounts.isEmpty()) {
            if(!confirm) {
                throw new AppException(ErrorCode.DISABLE_ACCOUNT_WARNING);
            } else {
                accounts.forEach(acc -> acc.setStatus(-1));
                accountRepository.saveAll(accounts);
            }
        }
        account.setUser(user);
        account.setStatus(request.getStatus());

        return accountMapper.toAccountResponse(accountRepository.save(account));
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

    public boolean disableAccount(String id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXISTED));

        if (account.getEmail().equals(ADMIN_EMAIL)) {
            throw new AppException(ErrorCode.CAN_NOT_DISABLE_ADMIN);
        }

        account.setStatus(-1);
        accountRepository.save(account);
        return true;
    }

    public boolean enableAccount(String id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXISTED));

        List<Account> accounts = accountRepository.findAllByUserId(account.getUser().getId());
        if (!accounts.isEmpty()) {
            accounts.forEach(acc -> acc.setStatus(-1));
            accountRepository.saveAll(accounts);
        }

        account.setStatus(1);
        accountRepository.save(account);
        return true;
    }

    @Transactional
    public AccountResponse updateAccount(String id, AccountUpdateRequest request, boolean confirm) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXISTED));

        boolean emailChange = !account.getEmail().equalsIgnoreCase(request.getEmail().trim());
        boolean userChange = !account.getUser().getId().equals(request.getUserId());

        if (!emailChange && !userChange) {
            throw new AppException(ErrorCode.NO_CHANGE_UPDATE);
        }

        if(account.getUser().getStatus() == 9999) {
            var uid = getUUIDFromJwt();
            var user = userRepository.findById(uid).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
            if(user.getStatus() != 9999){
                throw new AppException(ErrorCode.CAN_NOT_EDIT_ADMIN);
            }
        }

        if(emailChange) {
            accountRepository.findByEmail(request.getEmail())
                    .filter(acc -> !acc.getId().equals(id))
                    .ifPresent(acc -> {
                        throw new AppException(ErrorCode.ACCOUNT_EXISTED);
                    });
            account.setEmail(request.getEmail());
        }

        if(userChange) {
            var user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

            if(user.getStatus() == 9999){
                throw new AppException(ErrorCode.CAN_NOT_EDIT_ADMIN);
            }

            if(!request.getUserId().equals(account.getUser().getId())) {
                List<Account> accounts = accountRepository.findAllByUserId(request.getUserId());
                if (!accounts.isEmpty()) {
                    if (!confirm){
                        throw new AppException(ErrorCode.DISABLE_ACCOUNT_WARNING);
                    } else {
                        accounts.forEach(acc -> acc.setStatus(-1));
                        accountRepository.saveAll(accounts);
                    }
                }
            }
            account.setUser(user);
        }
        return accountMapper.toAccountResponse(accountRepository.save(account));
    }

    public boolean hardDeleteAccount(String id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXISTED));

        if (account.getEmail().equals(ADMIN_EMAIL)){
            throw new AppException(ErrorCode.CAN_NOT_DISABLE_ADMIN);
        }

        accountRepository.delete(account);
        return true;
    }
}
