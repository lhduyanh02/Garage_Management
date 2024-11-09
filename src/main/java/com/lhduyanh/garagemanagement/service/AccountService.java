package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.request.*;
import com.lhduyanh.garagemanagement.dto.response.*;
import com.lhduyanh.garagemanagement.entity.Account;
import com.lhduyanh.garagemanagement.entity.Address;
import com.lhduyanh.garagemanagement.entity.Role;
import com.lhduyanh.garagemanagement.entity.User;
import com.lhduyanh.garagemanagement.enums.AccountStatus;
import com.lhduyanh.garagemanagement.enums.UserStatus;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.mapper.AccountMapper;
import com.lhduyanh.garagemanagement.mapper.UserMapper;
import com.lhduyanh.garagemanagement.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Collator;
import java.text.MessageFormat;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
    OtpService otpService;
    Collator vietnameseCollator;
    CommonParameterRepository commonParameterRepository;
    EmailSenderService emailSenderService;

    @NonFinal
    @Value("${app.admin-email}")
    String ADMIN_EMAIL;

    @NonFinal
    @Value("${app.default-password}")
    String DEFAULT_PASSWORD;


    public AccountFullResponse getAccountById(String id) {
        return accountMapper.toAccountFullResponse(accountRepository.findByIdFetchAll(id)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXISTED)));
    }

    public List<AccountResponse> getAllAccounts() {
        return accountRepository.findAll()
                .stream()
                .map(accountMapper::toAccountResponse)
                .sorted(Comparator.comparing(AccountResponse::getEmail, vietnameseCollator))
                .toList();
    }

    public List<AccountResponse> getAllEnableAccounts() {
        return accountRepository.findAllByStatus(AccountStatus.CONFIRMED.getCode())
                .stream()
                .map(accountMapper::toAccountResponse)
                .sorted(Comparator.comparing(AccountResponse::getEmail, vietnameseCollator))
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
        user.setStatus(UserStatus.NOT_CONFIRM.getCode());
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
        Optional<Account> a = accountRepository.findByEmail(request.getEmail().trim());
            if (a.isPresent()) {
                if (a.get().getStatus() == AccountStatus.NOT_CONFIRM.getCode()) {
                    accountRepository.delete(a.get());
                }
                else {
                    throw new AppException(ErrorCode.ACCOUNT_EXISTED);
                }
            }

        Account account = new Account();
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
                .filter(u -> u.getStatus() != UserStatus.DELETED.getCode() && u.getStatus() != UserStatus.NOT_CONFIRM.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if(user.getStatus() == 9999){
            throw new AppException(ErrorCode.CAN_NOT_EDIT_ADMIN);
        } else if (user.getStatus() != UserStatus.CONFIRMED.getCode()){
            throw new AppException(ErrorCode.DISABLED_USER);
        }

        List<Account> accounts = accountRepository.findAllByUserId(request.getUserId())
                .stream()
                .filter(acc -> acc.getStatus() == AccountStatus.CONFIRMED.getCode())
                .toList();
        if (!accounts.isEmpty()) {
            if(!confirm) {
                throw new AppException(ErrorCode.DISABLE_ACCOUNT_WARNING);
            } else {
                accounts.forEach(acc -> acc.setStatus(AccountStatus.BLOCKED.getCode()));
                accountRepository.saveAll(accounts);
            }
        }
        account.setUser(user);
        account.setStatus(request.getStatus());

        var response = accountMapper.toAccountResponse(accountRepository.save(account));

        try {
            String facilityName = commonParameterRepository.findByKey("FACILITY_NAME").get().getValue();

            String body = """
                        <p>Xin chào <strong>{0}</strong>,</p>
                        <p>Tài khoản của bạn đã được khởi tạo trên Hệ thống chăm sóc ô tô <b>{1}</b> vào lúc {4}.</p>
                        <p><u>Thông tin đăng nhập:</u></p>
                        <ul>
                            <li><b>Email:</b> {2}</li>
                            <li><b>Mật khẩu mặc định:</b> {3}</li>
                        </ul>
                        
                        <p><i>*Lưu ý: Vui lòng đổi mật khẩu sau khi đăng nhập để bảo mật thông tin cá nhân của bạn.</i></p>

                        <p>Xin cảm ơn.</p>
                        <p>{1},<br><i>Trân trọng.</i></p>
                        """;

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm, 'ngày' dd/MM/yyyy");

            String message = MessageFormat.format(body,
                    user.getName(), // 0
                    facilityName, // 1
                    account.getEmail(), // 2
                    DEFAULT_PASSWORD, // 3
                    LocalDateTime.now().format(formatter));  // 4

            emailSenderService.sendHtmlEmail(account.getEmail(), "[" + facilityName.toUpperCase() + "] Tài khoản của bạn đã được tạo", message);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("Error in sending message while creating new account");
        }

        return response;
    }

    // User register with only role: CUSTOMER
    public UserRegisterResponse accountRegister(UserRegisterRequest request){
        var acc = accountRepository.findByEmail(request.getEmail());
        if(acc.isPresent()) {
            if (acc.get().getStatus() == AccountStatus.NOT_CONFIRM.getCode()) {
                if (Duration.between(acc.get().getGeneratedAt(), LocalDateTime.now()).toMinutes() < 1){
                    throw new AppException(ErrorCode.OTP_SEND_TIMER);
                }
                accountRepository.delete(acc.get());
            }
            else {
                throw new AppException(ErrorCode.ACCOUNT_EXISTED);
            }
        }

        request.setEmail(request.getEmail().trim());
        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
            // Xóa ký tự khoảng trắng , . -
            request.setPhone(request.getPhone().replaceAll("[,\\.\\-\\s]", ""));
        } else {
            request.setPhone(null);
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
        user.setStatus(UserStatus.NOT_CONFIRM.getCode());
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
        account.setStatus(AccountStatus.NOT_CONFIRM.getCode());

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
            if (account.getStatus() == AccountStatus.NOT_CONFIRM.getCode()) { // Chỉ xác thực cho account có status = 0
                account.setStatus(AccountStatus.CONFIRMED.getCode());
            }
            accountRepository.save(account);

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

            user.setStatus(UserStatus.CONFIRMED.getCode());
            userRepository.save(user);

            try { // Gửi email thông báo đã tạo tài khoản thành công
                String facilityName = commonParameterRepository.findByKey("FACILITY_NAME").get().getValue();

                String body = """
                        <p>Xin chào <strong>{0}</strong>,</p>
                        <p>Bạn đã tạo thành công tài khoản mới trên Hệ thống chăm sóc ô tô <b>{1}</b> vào lúc {2}.</p>
                        <p>Xin cảm ơn.</p>
                        <p>{1},<br><i>Trân trọng.</i></p>
                        """;

                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm, 'ngày' dd/MM/yyyy");

                String message = MessageFormat.format(body,
                        user.getName(), // 0
                        facilityName, // 1
                        LocalDateTime.now().format(formatter));  // 2

                emailSenderService.sendHtmlEmail(account.getEmail(), "Chào mừng bạn đến với" + facilityName, message);
            } catch (Exception e) {
                e.printStackTrace();
                log.error("Error in sending message after customer verified account");
            }

            return AccountVerifyResponse.builder().result(true).build();
        }
        return AccountVerifyResponse.builder().result(false).build();
    }

    public void regenerateOtpCode(String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXISTED));

        // Kiểm tra cách 1 phút kể từ lần gửi email trước
        if((account.getStatus() >= AccountStatus.NOT_CONFIRM.getCode()) && (Duration.between(account.getGeneratedAt(), LocalDateTime.now()).toMinutes() > 1)) {
            otpService.createSendOtpCode(account);
        }
        else {
            throw new AppException(ErrorCode.CANNOT_REGENERATE_OTP);
        }
    }

    public Boolean sendOtpToEmail(String email) {
        Account account = accountRepository.findByEmail(email)
                .filter(a -> a.getStatus() != AccountStatus.NOT_CONFIRM.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXISTED));

        if (account.getStatus() == AccountStatus.BLOCKED.getCode()) {
            throw new AppException(ErrorCode.BLOCKED_ACCOUNT);
        }

        // Kiểm tra cách 1 phút kể từ lần gửi email trước
        if((account.getStatus() >= AccountStatus.CONFIRMED.getCode()) && (Duration.between(account.getGeneratedAt(), LocalDateTime.now()).toMinutes() > 1)) {
            otpService.createSendOtpCode(account);
        }
        else {
            throw new AppException(ErrorCode.OTP_SEND_TIMER);
        }
        return true;
    }

    public AccountVerifyResponse accountEmailVerify (AccountVerifyRequest request) {
        boolean result = otpService.VerifyOtpCode(request.getEmail(), request.getOtpCode());
        if (result) {
            Account account = accountRepository.findByEmail(request.getEmail())
                    .filter(a -> a.getStatus() != AccountStatus.NOT_CONFIRM.getCode())
                    .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXISTED));

            if (account.getStatus() == AccountStatus.BLOCKED.getCode()) {
                throw new AppException(ErrorCode.BLOCKED_ACCOUNT);
            }

            User user = userRepository.findByEmail(request.getEmail())
                    .filter(u -> u.getStatus() != UserStatus.DELETED.getCode())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

            if (user.getStatus() == UserStatus.BLOCKED.getCode()) {
                throw new AppException(ErrorCode.BLOCKED_USER);
            }

            return AccountVerifyResponse.builder().result(true).build();
        }
        throw new AppException(ErrorCode.INCORRECT_OTP);
    }

    public Boolean passwordRecovery (PasswordRecoveryRequest request) {
        boolean result = otpService.VerifyOtpCode(request.getEmail(), request.getOtpCode());
        if (result) {
            Account account = accountRepository.findByEmail(request.getEmail())
                    .filter(a -> a.getStatus() != AccountStatus.NOT_CONFIRM.getCode())
                    .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXISTED));

            if (account.getStatus() == AccountStatus.BLOCKED.getCode()) {
                throw new AppException(ErrorCode.BLOCKED_ACCOUNT);
            }

            User user = userRepository.findByEmail(request.getEmail())
                    .filter(u -> u.getStatus() != UserStatus.DELETED.getCode())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

            if (user.getStatus() == UserStatus.BLOCKED.getCode()) {
                throw new AppException(ErrorCode.BLOCKED_USER);
            }

            account.setPassword(passwordEncoder.encode(request.getNewPassword()));
            account.setOtpCode(otpService.generateOtp());
            account.setGeneratedAt(LocalDateTime.now());
            accountRepository.save(account);

            return true;
        }
        throw new AppException(ErrorCode.INCORRECT_OTP);
    }

    public boolean disableAccount(String id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXISTED));

        if (account.getEmail().equals(ADMIN_EMAIL)) {
            throw new AppException(ErrorCode.CAN_NOT_DISABLE_ADMIN);
        }

        account.setStatus(AccountStatus.BLOCKED.getCode());
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

        account.setStatus(AccountStatus.CONFIRMED.getCode());
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
            throw new AppException(ErrorCode.CAN_NOT_EDIT_ADMIN);
        }

        if(emailChange) {
            Optional<Account> acc = accountRepository.findByEmail(request.getEmail())
                    .filter(a -> !a.getId().equals(id));
            if (acc.isPresent()) {
                if (acc.get().getStatus() == AccountStatus.NOT_CONFIRM.getCode()) {
                    accountRepository.delete(acc.get());
                } else {
                    throw new AppException(ErrorCode.ACCOUNT_EXISTED);
                }
            }
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
                        accounts.forEach(acc -> acc.setStatus(AccountStatus.BLOCKED.getCode()));
                        accountRepository.saveAll(accounts);
                    }
                }
            }
            account.setUser(user);
        }
        return accountMapper.toAccountResponse(accountRepository.save(account));
    }

    public Boolean changePassword(PasswordChangeRequest request) {
        String uid = getUUIDFromJwt();

        User user = userRepository.findById(uid)
                .filter(u -> u.getStatus() >= UserStatus.CONFIRMED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXISTED));

        if(user.getAccounts().stream().noneMatch(a -> a.getId().equals(account.getId()))) {
            throw new AppException(ErrorCode.NOT_YOUR_ACCOUNT);
        }

        if (account.getStatus() != AccountStatus.CONFIRMED.getCode()) {
            throw new AppException(ErrorCode.INACTIVE_ACCOUNT);
        }

        boolean authenticated = passwordEncoder.matches(request.getOldPassword(), account.getPassword());

        if (!authenticated) {
            throw new AppException(ErrorCode.INCORRECT_PASSWORD);
        }

        if (request.getNewPassword().isEmpty() || request.getNewPassword().length() < 8) {
            throw new AppException(ErrorCode.INVALID_PASSWORD);
        }

        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);
        return true;
    }

    public Boolean resetPasswordById(String id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXISTED));

        if (account.getUser().getStatus() == 9999) {
            throw new AppException(ErrorCode.CAN_NOT_EDIT_ADMIN);
        }

        account.setPassword(passwordEncoder.encode(DEFAULT_PASSWORD));
        accountRepository.save(account);
        return true;
    }

    public Boolean resetCustomerPassword(String id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXISTED));

        if (account.getUser().getStatus() == 9999) {
            throw new AppException(ErrorCode.CAN_NOT_EDIT_ADMIN);
        }

        if (account.getUser().getRoles().stream().noneMatch(r -> r.getRoleKey().equals("CUSTOMER"))) {
            throw new AppException(ErrorCode.USER_NOT_CUSTOMER);
        }

        account.setPassword(passwordEncoder.encode(DEFAULT_PASSWORD));
        accountRepository.save(account);

        try { // Gửi email thông báo đã đặt lại mật khẩu
            String facilityName = commonParameterRepository.findByKey("FACILITY_NAME").get().getValue();
            User user = account.getUser();

            String body = """
                        <p>Xin chào <strong>{0}</strong>,</p>
                        <p>Tài khoản của bạn đã được đặt lại mật khẩu vào lúc {1}.<br>Mật khẩu mặc định là: <i>{3}</i></p>
                        <p>Xin cảm ơn.</p>
                        <p>{2},<br><i>Trân trọng.</i></p>
                        """;

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm, 'ngày' dd/MM/yyyy");

            String message = MessageFormat.format(body,
                    user.getName(), // 0
                    LocalDateTime.now().format(formatter), // 1
                    facilityName, // 2
                    DEFAULT_PASSWORD);  // 3

            emailSenderService.sendHtmlEmail(account.getEmail(), "[" + facilityName.toUpperCase() + "] ĐẶT LẠI MẬT KHẨU", message);
        } catch (Exception e) {
            e.printStackTrace();
            log.error("Error in sending message after customer verified account");
        }

        return true;
    }

    public boolean hardDeleteAccount(String id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXISTED));

        if (account.getStatus() == AccountStatus.CONFIRMED.getCode()) {
            throw new AppException(ErrorCode.ACTIVE_ACCOUNT);
        }

        if (account.getEmail().equals(ADMIN_EMAIL)){
            throw new AppException(ErrorCode.CAN_NOT_DISABLE_ADMIN);
        }

        accountRepository.delete(account);
        return true;
    }
}
