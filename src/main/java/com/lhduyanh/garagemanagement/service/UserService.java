package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.request.CustomerCreationRequest;
import com.lhduyanh.garagemanagement.dto.request.UserCarMappingRequest;
import com.lhduyanh.garagemanagement.dto.request.UserCreationRequest;
import com.lhduyanh.garagemanagement.dto.request.UserUpdateRequest;
import com.lhduyanh.garagemanagement.dto.response.*;
import com.lhduyanh.garagemanagement.entity.*;
import com.lhduyanh.garagemanagement.enums.*;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.mapper.UserMapper;
import com.lhduyanh.garagemanagement.repository.*;
import lombok.AccessLevel;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Collator;
import java.text.MessageFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
    Collator vietnameseCollator;
    PasswordEncoder passwordEncoder;
    CommonParameterRepository commonParameterRepository;
    EmailSenderService emailSenderService;
    private final PermissionRepository permissionRepository;

    @NonFinal
    @Value("${app.default-password}")
    String DEFAULT_PASSWORD;

    public List<UserFullResponse> getAllUserWithAddress(){
        List<User> users = userRepository.findAllUserFullInfo();
        return users.stream()
                .filter(u -> u.getStatus() != UserStatus.DELETED.getCode())
                .map(user -> {
                    UserFullResponse response = userMapper.toUserFullResponse(user);

                    // Lọc các cars trong UserResponse dựa trên trạng thái
                    List<CarResponse> filteredCars = response.getCars().stream()
                            .filter(car -> car.getStatus()!=CarStatus.DELETED.getCode())
                            .collect(Collectors.toList());
                    response.setCars(filteredCars);

                    if (response.getAccounts().size() > 0) {
                        response.setAccounts(response.getAccounts().stream().filter(a -> a.getStatus() == AccountStatus.CONFIRMED.getCode())
                                .toList());
                    }

                    return response;
                })
                .sorted(Comparator.comparing(UserFullResponse::getName, vietnameseCollator))
                .collect(Collectors.toList());
    };

    public List<UserResponse> getAllActiveUser(){
        List<User> users = userRepository.findAllActiveUserFetchCars();
        return users.stream()
                .filter(u -> u.getStatus() == UserStatus.CONFIRMED.getCode())
                .map(user -> {
                    UserResponse response = userMapper.toUserResponse(user);

                    // Lọc các cars trong UserResponse dựa trên trạng thái
                    List<CarResponse> filteredCars = response.getCars().stream()
                            .filter(car -> car.getStatus() != CarStatus.DELETED.getCode())
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
                            .filter(account -> account.getStatus() == AccountStatus.CONFIRMED.getCode())
                            .toList();
                    response.setAccounts(accounts);

                    return response;
                })
                .sorted(Comparator.comparing(UserFullResponse::getName, vietnameseCollator))
                .filter(user -> !user.getRoles().isEmpty() && user.getStatus() == UserStatus.CONFIRMED.getCode())
                .collect(Collectors.toList());
    };

    public List<UserFullResponse> getAllCustomers(){
        List<User> users = userRepository.findAllCustomerFullInfo();
        return users.stream()
                .map(user -> {
                    UserFullResponse response = userMapper.toUserFullResponse(user);
                    Set<RoleSimpleResponse> roles = response.getRoles()
                            .stream()
                            .filter(role -> role.getStatus() == RoleStatus.USING.getCode())
                            .collect(Collectors.toSet());
                    response.setRoles(roles);

                    List<CarResponse> cars = response.getCars().stream()
                            .filter(car -> car.getStatus() != CarStatus.DELETED.getCode())
                            .toList();
                    response.setCars(cars);

                    List<AccountSimpleResponse> accounts = response.getAccounts()
                            .stream()
                            .filter(account -> account.getStatus() == AccountStatus.CONFIRMED.getCode())
                            .toList();
                    response.setAccounts(accounts);

                    return response;
                })
                .sorted(Comparator.comparing(UserFullResponse::getName, vietnameseCollator))
                .filter(user -> !user.getRoles().isEmpty() && user.getStatus() != UserStatus.DELETED.getCode())
                .collect(Collectors.toList());
    };

    public List<UserWithAccountsResponse> getAllUserWithAccounts(){
        List<User> users = userRepository.findAllWithAccounts();
        return users
                .stream()
                .filter(user -> user.getStatus() != 9999 && user.getStatus() != UserStatus.DELETED.getCode())
                .map(userMapper::toUserWithAccountsResponse)
                .sorted(Comparator.comparing(UserWithAccountsResponse::getName, vietnameseCollator))
                .toList();
    }

    public List<UserWithAccountsResponse> getAllUserHasTelegramID(){
        List<User> users = userRepository.findAllHasTelegram();
        return users.stream()
                .filter(user -> user.getStatus() >= UserStatus.CONFIRMED.getCode())
                .map( u-> {
                    UserWithAccountsResponse response = userMapper.toUserWithAccountsResponse(u);
                    response.setAccounts(response.getAccounts().stream()
                            .filter(a -> a.getStatus() == AccountStatus.CONFIRMED.getCode())
                            .collect(Collectors.toList()));
                    return response;
                })
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

    public UserFullResponse getCustomerById(String id){
        return userRepository.findByIdFullInfo(id)
                .filter(u -> u.getStatus() != UserStatus.DELETED.getCode())
                .map(u -> {
                    Set<Role> listRole = new HashSet<>();
                    boolean isCustomer = false;
                    for(Role r : u.getRoles()){
                        if(r.getStatus()==RoleStatus.USING.getCode()){
                            listRole.add(r);
                            if (r.getRoleKey().equals("CUSTOMER")){
                                isCustomer = true;
                            }
                        }
                    }
                    u.setRoles(listRole);

                    if (!isCustomer){
                        throw new AppException(ErrorCode.USER_NOT_CUSTOMER);
                    }

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
                .filter(u -> u.getStatus() != UserStatus.DELETED.getCode() && u.getStatus() != UserStatus.NOT_CONFIRM.getCode())
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

                    if (u.getStatus() == 9999) {
                        u.setRoles(roleRepository.findAll().stream().collect(Collectors.toSet()));
                    }

                    return userMapper.toUserFullResponse(u);
                })
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    @Transactional
    public List<String> getAllMyPermissions(){
        var UUID = getUUIDFromJwt();
        User user = userRepository.findByIdFullInfo(UUID)
                .filter(u -> u.getStatus() >= UserStatus.CONFIRMED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        if (user.getStatus() == 9999) {
            return new ArrayList<>(permissionRepository.findAll().stream().map(Permissions::getPermissionKey).toList());
        }

        user.setRoles(new HashSet<>(user.getRoles().stream().filter(r -> r.getStatus() == RoleStatus.USING.getCode()).collect(Collectors.toSet())));

        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            throw new AppException(ErrorCode.EMPTY_ROLE_USER);
        }

        Set<String> permissions = new HashSet<>();

        for (Role role : user.getRoles()) {
            for (Permissions permission : role.getPermissions()) {
                permissions.add(permission.getPermissionKey());
            }
        }

        return new ArrayList<>(permissions);
    }

    public UserResponse createUser(UserCreationRequest request){
        if (request.getPhone() != null) {
            request.setPhone(request.getPhone().replaceAll("[,\\.\\-\\s]", ""));
        }

        User user = userMapper.toUser(request);
        if(!(request.getAddressId() <= 0)) {
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

        if (request.getStatus() == 9999) {
            throw new AppException(ErrorCode.INVALID_STATUS);
        }
        
        return userMapper.toUserResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse newCustomer(CustomerCreationRequest request){
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            request.setEmail(request.getEmail().trim());
            Optional<Account> acc = accountRepository.findByEmail(request.getEmail());

            if (acc.isPresent()) {
                if (acc.get().getStatus() == AccountStatus.NOT_CONFIRM.getCode()) {
                    accountRepository.delete(acc.get());
                } else {
                    throw new AppException(ErrorCode.ACCOUNT_EXISTED);
                }
            }
        }
        
        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
            request.setPhone(request.getPhone().replaceAll("[,\\.\\-\\s]", ""));
        } else {
            request.setPhone(null);
        }

        User user = userMapper.toUser(request);
        if(!(request.getAddressId() <= 0)) {
            var address = addressRepository.findById(request.getAddressId());
            address.ifPresent(user::setAddress);
        }

        Set<Role> roles = new HashSet<>();
        roles.add(roleRepository.findByRoleKey("CUSTOMER").get());

        user.setRoles(roles);
        
        user.setStatus(UserStatus.CONFIRMED.getCode());

        user = userRepository.save(user);
        
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            Account account = Account.builder()
                    .user(user)
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(DEFAULT_PASSWORD))
                    .status(AccountStatus.CONFIRMED.getCode())
                    .build();
            accountRepository.save(account);
            Set<Account> accounts = new HashSet<>();
            accounts.add(account);
            user.setAccounts(accounts);
            userRepository.save(user);

            try {
                String facilityName = commonParameterRepository.findByKey("FACILITY_NAME").get().getValue();

                String body = """
                        <p>Xin chào <strong>{0}</strong>,</p>
                        <p>Tài khoản khách hàng của bạn đã được khởi tạo trên Hệ thống chăm sóc ô tô <b>{1}</b> vào lúc {4}.</p>
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

                emailSenderService.sendHtmlEmail(account.getEmail(), "[" + facilityName.toUpperCase() + "] Tài khoản khách hàng của bạn đã được tạo", message);
            } catch (Exception e) {
                e.printStackTrace();
                log.error("Error in sending message while creating new customer");
            }
        }

        return userMapper.toUserResponse(user);
    }

    @Transactional
    public UserResponse updateCustomer(String id, CustomerCreationRequest request){
        User user = userRepository.findByIdFullInfo(id)
                .filter(u -> u.getStatus() != UserStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            Optional<Account> acc = accountRepository.findByEmail(request.getEmail())
                    .filter(a -> !a.getUser().getId().equals(id));
            if (acc.isPresent()) {
                if (acc.get().getStatus() == AccountStatus.NOT_CONFIRM.getCode()) {
                    accountRepository.delete(acc.get());
                } else {
                    throw new AppException(ErrorCode.ACCOUNT_EXISTED);
                }
            }
        }

        Set<Account> accounts = user.getAccounts();
        if (accounts == null || accounts.isEmpty()) { // Neu hien tai user chua co tai khoan -> kiem tra tao, tai khoan moi
            if (request.getEmail() != null && !request.getEmail().isEmpty()) { // Neu request co email thi tao tk moi
                Account account = Account.builder()
                        .email(request.getEmail().trim())
                        .password(passwordEncoder.encode(DEFAULT_PASSWORD))
                        .user(user)
                        .status(1)
                        .build();

                account = accountRepository.save(account);
                accounts.add(account);
                user.setAccounts(accounts);
            }
        } else {
            // Neu trong list khong co tai khoan nao dang hoat dong -> them tai khoan moi
            if (accounts.stream().filter(a -> a.getStatus() == UserStatus.CONFIRMED.getCode()).toList().isEmpty()) {
                Account account = Account.builder()
                        .email(request.getEmail().trim())
                        .password(passwordEncoder.encode(DEFAULT_PASSWORD))
                        .user(user)
                        .status(1)
                        .build();

                account = accountRepository.save(account);
                accounts.add(account);
                user.setAccounts(accounts);
            } else { // Neu trong list co tai khoan dang hoat dong
                // Neu khong dien email -> bao loi
                if (request.getEmail() == null || request.getEmail().isEmpty()) {
                    throw new AppException(ErrorCode.BLANK_EMAIL);
                }
                Optional<Account> optionalAccount = accounts.stream().filter(a -> a.getStatus() == UserStatus.CONFIRMED.getCode()).findFirst();

                if (optionalAccount.isEmpty()) {
                    throw new AppException(ErrorCode.UPDATE_ACCOUNT_FAILED);
                } else {
                    Account account = optionalAccount.get();
                    account.setEmail(request.getEmail());
                    accountRepository.save(account);
                    accounts.stream().filter(a -> !a.getId().equals(account.getId())).forEach(a -> {
                        if (a.getStatus() == UserStatus.CONFIRMED.getCode()) {
                            a.setStatus(AccountStatus.BLOCKED.getCode());
                            accountRepository.save(a);
                        }
                    });
                }
            }
        }

        user.setName(request.getName());
        if (request.getGender() >= -1 && request.getGender() < 2) {
            user.setGender(request.getGender());
        }

        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
            request.setPhone(request.getPhone().replaceAll("[,\\.\\-\\s]", ""));
        }

        if(!(request.getAddressId() <= 0)) {
            var address = addressRepository.findById(request.getAddressId());
            address.ifPresent(user::setAddress);
        }

        user = userRepository.save(user);
        return userMapper.toUserResponse(user);
    }

    @Transactional
    public UserResponse updateUser(String userId, UserUpdateRequest request){
        User user = userRepository.findById(userId)
                .filter( u -> u.getStatus() != UserStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (user.getStatus() == 9999) {
            throw new AppException(ErrorCode.CAN_NOT_EDIT_ADMIN);
        }

        if (request.getTelegramId() != null) {
            if (userRepository.findByTelegramId(request.getTelegramId()).filter(u -> !u.getId().equals(user.getId())).isPresent()) {
                throw new AppException(ErrorCode.TELEGRAM_ID_EXISTED);
            }
        }

        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
            // Xóa ký tự khoảng trắng , . -
            request.setPhone(request.getPhone().replaceAll("[,\\.\\-\\s]", ""));
            if(request.getPhone().length()<6) {
                throw new AppException(ErrorCode.INVALID_PHONE_NUMBER);
            }
        } else {
            request.setPhone(null);
        }

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

    @Transactional
    public UserFullResponse userSelfUpdate(UserUpdateRequest request){
        String id = getUUIDFromJwt();
        User user = userRepository.findById(id)
                .filter( u -> u.getStatus() != UserStatus.DELETED.getCode() && u.getStatus() != UserStatus.NOT_CONFIRM.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
            // Xóa ký tự khoảng trắng , . -
            request.setPhone(request.getPhone().replaceAll("[,\\.\\-\\s]", ""));
            if(request.getPhone().length()<6) {
                throw new AppException(ErrorCode.INVALID_PHONE_NUMBER);
            }
        } else {
            request.setPhone(null);
        }

        if (request.getTelegramId() != null) {
            if (userRepository.findByTelegramId(request.getTelegramId()).filter(u -> !u.getId().equals(user.getId())).isPresent()) {
                throw new AppException(ErrorCode.TELEGRAM_ID_EXISTED);
            }
        }

        userMapper.updateUser(user, request);

        if(!(request.getAddressId() <= 0)) {
            var address = addressRepository.findById(request.getAddressId());
            address.ifPresent(addr -> {
                user.setAddress(addr);
            });
        } else {
            user.setAddress(null);
        }

        if (request.getTelegramId() != null) {
            user.setTelegramId(request.getTelegramId());
        }

        userRepository.save(user);
        Hibernate.initialize(user.getAddress());
        Hibernate.initialize(user.getRoles());
        Hibernate.initialize(user.getCars());
        Hibernate.initialize(user.getAccounts());

        UserFullResponse response = userMapper.toUserFullResponse(user);

        response.setCars(response.getCars().stream()
                .filter(c -> c.getStatus() == CarStatus.USING.getCode())
                .toList());

        response.setAccounts(response.getAccounts().stream()
                .filter(a -> a.getStatus() == AccountStatus.CONFIRMED.getCode())
                .toList());

        response.setRoles(response.getRoles().stream()
                .filter(r -> r.getStatus() == RoleStatus.USING.getCode())
                .collect(Collectors.toSet()));

        return response;
    }

    public void deleteUserById(String id) {
        var user = userRepository.findByIdFullInfo(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (user.getStatus() == 9999) {
            throw new AppException(ErrorCode.CAN_NOT_EDIT_ADMIN);
        }

        if (user.getStatus() != UserStatus.NOT_CONFIRM.getCode() && user.getStatus() != UserStatus.BLOCKED.getCode()){
            throw new AppException(ErrorCode.DELETE_ACTIVATED_USER);
        }

        List<Account> accounts = accountRepository.findAllByUserId(user.getId());
        if (!accounts.isEmpty()){
            accountRepository.deleteAll(accounts);
        }

        userRepository.deleteById(id);
    }

    public void hardDeleteUserById(String id) {
        var user = userRepository.findById(id)
                .filter(u -> u.getStatus() != UserStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (user.getStatus() == 9999) {
            throw new AppException(ErrorCode.CAN_NOT_EDIT_ADMIN);
        }

        List<Account> accounts = accountRepository.findAllByUserId(user.getId());
        if (!accounts.isEmpty()){
            accountRepository.deleteAll(accounts);
        }

        user.setStatus(UserStatus.DELETED.getCode());
        userRepository.save(user);
    }

    public void disableUserById(String id) {
        var user = userRepository.findById(id).
                filter(u -> u.getStatus() != UserStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (user.getStatus() == 9999) {
            throw new AppException(ErrorCode.CAN_NOT_EDIT_ADMIN);
        }

        if (user.getStatus() != UserStatus.CONFIRMED.getCode() && user.getStatus() != UserStatus.NOT_CONFIRM.getCode()){
            throw new AppException(ErrorCode.DISABLE_ACTIVE_USER_ONLY);
        }

        user.setStatus(UserStatus.BLOCKED.getCode());
        userRepository.save(user);
    }

    public void activateUserById(String id) {
        var user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (user.getStatus() == 9999) {
            throw new AppException(ErrorCode.CAN_NOT_EDIT_ADMIN);
        }

        user.setStatus(UserStatus.CONFIRMED.getCode());
        userRepository.save(user);
    }

    public boolean disableCustomerById(String id) {
        var user = userRepository.findById(id).
                filter(u -> u.getStatus() != UserStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (user.getRoles().stream().filter(r -> r.getStatus() == RoleStatus.USING.getCode()).noneMatch(r -> r.getRoleKey().equals("CUSTOMER"))) {
            throw new AppException(ErrorCode.USER_NOT_CUSTOMER);
        }

        if (user.getStatus() == 9999) {
            throw new AppException(ErrorCode.CAN_NOT_EDIT_ADMIN);
        }

        if (user.getStatus() != UserStatus.CONFIRMED.getCode() && user.getStatus() != UserStatus.NOT_CONFIRM.getCode()){
            throw new AppException(ErrorCode.DISABLE_ACTIVE_USER_ONLY);
        }

        user.setStatus(UserStatus.BLOCKED.getCode());
        userRepository.save(user);
        return true;
    }

    public boolean activateCustomerById(String id) {
        var user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (user.getRoles().stream().filter(r -> r.getStatus() == RoleStatus.USING.getCode()).noneMatch(r -> r.getRoleKey().equals("CUSTOMER"))) {
            throw new AppException(ErrorCode.USER_NOT_CUSTOMER);
        }

        if (user.getStatus() == 9999) {
            throw new AppException(ErrorCode.CAN_NOT_EDIT_ADMIN);
        }

        user.setStatus(UserStatus.CONFIRMED.getCode());
        userRepository.save(user);
        return true;
    }

    public boolean userCarMapping(UserCarMappingRequest request) {
        User user = userRepository.findById(request.getUserId())
                .filter(u -> u.getStatus() != UserStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if(user.getStatus() != UserStatus.CONFIRMED.getCode()) {
            throw new AppException(ErrorCode.DISABLED_USER);
        }

        if (user.getRoles().stream().filter(r -> r.getStatus() == RoleStatus.USING.getCode()).noneMatch(r -> r.getRoleKey().equals("CUSTOMER"))) {
            throw new AppException(ErrorCode.USER_NOT_CUSTOMER);
        }

        Car car = carRepository.findById(request.getCarId())
                .filter(c -> c.getStatus() != CarStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_EXISTS));

        Set<Car> carSet = user.getCars();
        if(!carSet.contains(car)) {
            carSet.add(car);
            user.setCars(carSet);
        }
        userRepository.save(user);
        return true;
    }

    public boolean userCarRemoveMapping(UserCarMappingRequest request) {
        User user = userRepository.findById(request.getUserId())
                .filter(u -> u.getStatus() != UserStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Car car = carRepository.findById(request.getCarId())
                .filter(c -> c.getStatus() != CarStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_EXISTS));

        Set<Car> carSet = user.getCars();

        var findCar = carSet.stream().filter(c -> c.getId().equals(car.getId())).findFirst();

        if(findCar.isPresent()) {
            carSet.remove(findCar.get());
            user.setCars(carSet);
            userRepository.save(user);
        } else {
            throw new AppException(ErrorCode.USER_NOT_MANAGE_CAR);
        }

        return true;
    }

    public Long getCustomerQuantity() {
        return userRepository.countByRoleKeyAndStatus("CUSTOMER", 1);
    }

}
