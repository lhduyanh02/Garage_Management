package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.dto.request.AppointmentCreationRequest;
import com.lhduyanh.garagemanagement.dto.request.AppointmentUpdateRequest;
import com.lhduyanh.garagemanagement.dto.request.DetailAppointmentCreationRequest;
import com.lhduyanh.garagemanagement.dto.response.*;
import com.lhduyanh.garagemanagement.entity.*;
import com.lhduyanh.garagemanagement.enums.*;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.mapper.AppointmentMapper;
import com.lhduyanh.garagemanagement.mapper.DetailAppointmentMapper;
import com.lhduyanh.garagemanagement.repository.*;
import jakarta.mail.MessagingException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cglib.core.Local;
import org.springframework.transaction.annotation.Transactional;
import org.yaml.snakeyaml.emitter.Emitable;

import java.text.Collator;
import java.text.MessageFormat;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import static com.lhduyanh.garagemanagement.configuration.SecurityExpression.getUUIDFromJwt;

@org.springframework.stereotype.Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    UserRepository userRepository;
    ServiceRepository serviceRepository;
    OptionRepository optionRepository;
    AppointmentRepository appointmentRepository;
    DetailAppointmentRepository detailAppointmentRepository;
    CommonParameterRepository commonParameterRepository;

    AppointmentMapper appointmentMapper;
    DetailAppointmentMapper detailAppointmentMapper;
    Collator vietnameseCollator;

    EmailSenderService emailSenderService;
    TelegramService telegramService;

    public List<AppointmentResponse> getAllAppointments() {
        return appointmentRepository.findAllFetchData()
                .stream()
                .filter(a -> a.getStatus() != AppointmentStatus.DELETED.getCode())
                .map(appointment -> {
                    AppointmentResponse response = appointmentMapper.toResponse(appointment);

                    UserWithAccountsResponse customer = response.getCustomer();
                    List<AccountSimpleResponse> acc1 = customer.getAccounts().stream().filter(a -> a.getStatus() == AccountStatus.CONFIRMED.getCode()).toList();
                    customer.setAccounts(acc1);
                    response.setCustomer(customer);

                    if (response.getAdvisor() != null) {
                        UserWithAccountsResponse advisor = response.getAdvisor();
                        List<AccountSimpleResponse> acc2 = advisor.getAccounts().stream().filter(a -> a.getStatus() == AccountStatus.CONFIRMED.getCode()).toList();
                        advisor.setAccounts(acc2);
                        response.setAdvisor(advisor);
                    }

                    List<DetailAppointmentResponse> details = detailAppointmentRepository.findAllByAppointmentId(response.getId())
                            .stream()
                            .map(detailAppointmentMapper::toResponse)
                            .sorted(Comparator.comparing(DetailAppointmentResponse::getServiceName, vietnameseCollator))
                            .toList();

                    response.setDetails(details);

                    return response;
                })
                .sorted(Comparator.comparing(AppointmentResponse::getTime).reversed())
                .toList();
    }

    public List<AppointmentResponse> getAllAppointmentByCustomerId(String customerId, Boolean latestOrder) {
        if (customerId == null || customerId.isEmpty()) {
            customerId = getUUIDFromJwt();
        }

        if (latestOrder == null) {
            latestOrder = true;
        }

        return appointmentRepository.findAllByCustomerId(customerId)
                .stream()
                .filter(a -> a.getStatus() != AppointmentStatus.DELETED.getCode())
                .map(appointment -> {
                    AppointmentResponse response = appointmentMapper.toResponse(appointment);

                    UserWithAccountsResponse customer = response.getCustomer();
                    List<AccountSimpleResponse> acc1 = customer.getAccounts().stream().filter(a -> a.getStatus() == AccountStatus.CONFIRMED.getCode()).toList();
                    customer.setAccounts(acc1);
                    response.setCustomer(customer);

                    if (response.getAdvisor() != null) {
                        UserWithAccountsResponse advisor = response.getAdvisor();
                        List<AccountSimpleResponse> acc2 = advisor.getAccounts().stream().filter(a -> a.getStatus() == AccountStatus.CONFIRMED.getCode()).toList();
                        advisor.setAccounts(acc2);
                        response.setAdvisor(advisor);
                    }

                    List<DetailAppointmentResponse> details = detailAppointmentRepository.findAllByAppointmentId(response.getId())
                            .stream()
                            .map(detailAppointmentMapper::toResponse)
                            .sorted(Comparator.comparing(DetailAppointmentResponse::getServiceName, vietnameseCollator))
                            .toList();

                    response.setDetails(details);

                    return response;
                })
                .sorted(Comparator.comparing(AppointmentResponse::getTime,
                        latestOrder ? Comparator.naturalOrder() : Comparator.reverseOrder()))
                .toList();
    }

    public List<AppointmentResponse> getAllAppointmentsByTimeRange(LocalDateTime start, LocalDateTime end) {
        return appointmentRepository.findAllByTimeRangeFetchData(start, end)
                .stream()
                .filter(a -> a.getStatus() != AppointmentStatus.DELETED.getCode())
                .map(appointment -> {
                    AppointmentResponse response = appointmentMapper.toResponse(appointment);

                    UserWithAccountsResponse customer = response.getCustomer();
                    List<AccountSimpleResponse> acc1 = customer.getAccounts().stream().filter(a -> a.getStatus() == AccountStatus.CONFIRMED.getCode()).toList();
                    customer.setAccounts(acc1);
                    response.setCustomer(customer);

                    if (response.getAdvisor() != null) {
                        UserWithAccountsResponse advisor = response.getAdvisor();
                        List<AccountSimpleResponse> acc2 = advisor.getAccounts().stream().filter(a -> a.getStatus() == AccountStatus.CONFIRMED.getCode()).toList();
                        advisor.setAccounts(acc2);
                        response.setAdvisor(advisor);
                    }

                    List<DetailAppointmentResponse> details = detailAppointmentRepository.findAllByAppointmentId(response.getId())
                            .stream()
                            .map(detailAppointmentMapper::toResponse)
                            .sorted(Comparator.comparing(DetailAppointmentResponse::getServiceName, vietnameseCollator))
                            .toList();

                    response.setDetails(details);

                    return response;
                })
                .sorted(Comparator.comparing(AppointmentResponse::getTime).reversed())
                .toList();
    }

    public List<AppointmentResponse> getAllAppointmentsByCreateTimeRange(LocalDateTime start, LocalDateTime end) {
        return appointmentRepository.findAllByCreateTimeRangeFetchData(start, end)
                .stream()
                .filter(a -> a.getStatus() != AppointmentStatus.DELETED.getCode())
                .map(appointment -> {
                    AppointmentResponse response = appointmentMapper.toResponse(appointment);

                    UserWithAccountsResponse customer = response.getCustomer();
                    List<AccountSimpleResponse> acc1 = customer.getAccounts().stream().filter(a -> a.getStatus() == AccountStatus.CONFIRMED.getCode()).toList();
                    customer.setAccounts(acc1);
                    response.setCustomer(customer);

                    if (response.getAdvisor() != null) {
                        UserWithAccountsResponse advisor = response.getAdvisor();
                        List<AccountSimpleResponse> acc2 = advisor.getAccounts().stream().filter(a -> a.getStatus() == AccountStatus.CONFIRMED.getCode()).toList();
                        advisor.setAccounts(acc2);
                        response.setAdvisor(advisor);
                    }

                    List<DetailAppointmentResponse> details = detailAppointmentRepository.findAllByAppointmentId(response.getId())
                            .stream()
                            .map(detailAppointmentMapper::toResponse)
                            .sorted(Comparator.comparing(DetailAppointmentResponse::getServiceName, vietnameseCollator))
                            .toList();

                    response.setDetails(details);

                    return response;
                })
                .sorted(Comparator.comparing(AppointmentResponse::getCreateAt).reversed())
                .toList();
    }

    public AppointmentResponse getAppointmentById(String id) {
        Appointment appointment = appointmentRepository.findByIdFetchData(id)
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_EXIST));

        List<DetailAppointment> details = detailAppointmentRepository.findAllByAppointmentId(appointment.getId());

        AppointmentResponse response = appointmentMapper.toResponse(appointment);

        UserWithAccountsResponse customer = response.getCustomer();
        List<AccountSimpleResponse> acc1 = customer.getAccounts().stream().filter(a -> a.getStatus() == AccountStatus.CONFIRMED.getCode()).toList();
        customer.setAccounts(acc1);
        response.setCustomer(customer);

        if (response.getAdvisor() != null) {
            UserWithAccountsResponse advisor = response.getAdvisor();
            List<AccountSimpleResponse> acc2 = advisor.getAccounts().stream().filter(a -> a.getStatus() == AccountStatus.CONFIRMED.getCode()).toList();
            advisor.setAccounts(acc2);
            response.setAdvisor(advisor);
        }

        response.setDetails(details.stream().map(detailAppointmentMapper::toResponse).toList());

        return response;
    }

    @Transactional
    public AppointmentResponse newAppointmentByStaff(AppointmentCreationRequest appointmentRequest) {
        Appointment appointment = new Appointment();
        String advisorId = getUUIDFromJwt();

        if (appointmentRequest.getCustomerId() == null || appointmentRequest.getCustomerId().isEmpty()) {
            throw new AppException(ErrorCode.BLANK_USER);
        }

        appointmentRepository.findAllByCustomerId(appointmentRequest.getCustomerId())
                .stream()
                .filter(a -> a.getStatus() != AppointmentStatus.DELETED.getCode())
                .peek(a -> {
                    if (a.getStatus() == AppointmentStatus.PENDING_CONFIRM.getCode()) {
                        throw new AppException(ErrorCode.HAVE_PENDING_APPOINTMENT);
                    }
                    if (a.getStatus() == AppointmentStatus.UPCOMING.getCode()) {
                        throw new AppException(ErrorCode.HAVE_UPCOMING_APPOINTMENT);
                    }
                }).toList();

        User customer = userRepository.findByIdFullInfo(appointmentRequest.getCustomerId())
                .filter(u -> (u.getStatus() != UserStatus.DELETED.getCode() && u.getStatus() != UserStatus.NOT_CONFIRM.getCode()))
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (customer.getStatus() == UserStatus.BLOCKED.getCode()) {
            throw new AppException(ErrorCode.BLOCKED_USER);
        }

        appointment.setCustomer(customer);

        User advisor = userRepository.findByIdFullInfo(advisorId)
                .filter(u -> (u.getStatus() != UserStatus.DELETED.getCode() && u.getStatus() != UserStatus.NOT_CONFIRM.getCode()))
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_ADVISOR));

        if (advisor.getStatus() == UserStatus.BLOCKED.getCode()) {
            throw new AppException(ErrorCode.INVALID_ADVISOR);
        }

        appointment.setAdvisor(advisor);

        String startStr = commonParameterRepository.findByKey("OPENING_TIME").get().getValue();
        String endStr = commonParameterRepository.findByKey("CLOSING_TIME").get().getValue();

        LocalTime openingTime = null;
        LocalTime closingTime = null;

        try {
            openingTime = LocalTime.parse(startStr, DateTimeFormatter.ofPattern("HH:mm"));
            closingTime = LocalTime.parse(endStr, DateTimeFormatter.ofPattern("HH:mm"));
        } catch (DateTimeParseException e) {
            e.printStackTrace();
            throw new AppException(ErrorCode.INVALID_TIME_FORMAT);
        }

        LocalTime selectedTime = appointmentRequest.getTime().toLocalTime();

        if (selectedTime.isBefore(openingTime) || selectedTime.isAfter(closingTime)) {
            throw new AppException(ErrorCode.CLOSING_TIME_APPOINTMENT);
        }

        if (appointmentRequest.getTime().isBefore(LocalDateTime.now().plusMinutes(10))) {
            throw new AppException(ErrorCode.MINIMUM_SCHEDULE_TIME);
        }

        if (appointmentRequest.getDetails().isEmpty()) {
            throw new AppException(ErrorCode.DETAIL_LIST_EMPTY);
        }

        appointment.setContact(appointmentRequest.getContact());
        appointment.setTime(appointmentRequest.getTime());
        appointment.setCreateAt(LocalDateTime.now());
        appointment.setStatus(appointmentRequest.getStatus());
        appointment.setDescription(appointmentRequest.getDescription());
        appointment = appointmentRepository.save(appointment);

        AppointmentResponse response = updateListDetailAppointment(appointment.getId(), appointmentRequest.getDetails(), true);

        return response;
    }

    @Transactional
    public AppointmentResponse newAppointmentByCustomer(AppointmentCreationRequest request) {
        Appointment appointment = new Appointment();

        request.setCustomerId(getUUIDFromJwt());
        if (request.getCustomerId() == null || request.getCustomerId().isEmpty()) {
            throw new AppException(ErrorCode.BLANK_USER);
        }

        appointmentRepository.findAllByCustomerId(request.getCustomerId())
                .stream()
                .filter(a -> a.getStatus() != AppointmentStatus.DELETED.getCode())
                .peek(a -> {
                    if (a.getStatus() == AppointmentStatus.PENDING_CONFIRM.getCode()) {
                        throw new AppException(ErrorCode.HAVE_PENDING_APPOINTMENT);
                    }
                    if (a.getStatus() == AppointmentStatus.UPCOMING.getCode()) {
                        throw new AppException(ErrorCode.HAVE_UPCOMING_APPOINTMENT);
                    }
                }).toList();

        User customer = userRepository.findByIdFullInfo(request.getCustomerId())
                .filter(u -> (u.getStatus() != UserStatus.DELETED.getCode() && u.getStatus() != UserStatus.NOT_CONFIRM.getCode()))
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (customer.getStatus() == UserStatus.BLOCKED.getCode()) {
            throw new AppException(ErrorCode.BLOCKED_USER);
        }

        boolean hasRoleCustomer = customer.getRoles().stream()
                .anyMatch(r -> r.getRoleKey().equals("CUSTOMER"));

        if (!hasRoleCustomer) {
            throw new AppException(ErrorCode.USER_NOT_CUSTOMER);
        }

        appointment.setCustomer(customer);

        String startStr = commonParameterRepository.findByKey("OPENING_TIME").get().getValue();
        String endStr = commonParameterRepository.findByKey("CLOSING_TIME").get().getValue();

        LocalTime openingTime = null;
        LocalTime closingTime = null;

        try {
            openingTime = LocalTime.parse(startStr, DateTimeFormatter.ofPattern("HH:mm"));
            closingTime = LocalTime.parse(endStr, DateTimeFormatter.ofPattern("HH:mm"));
        } catch (DateTimeParseException e) {
            e.printStackTrace();
            throw new AppException(ErrorCode.INVALID_TIME_FORMAT);
        }

        LocalTime selectedTime = request.getTime().toLocalTime();

        if (selectedTime.isBefore(openingTime) || selectedTime.isAfter(closingTime)) {
            throw new AppException(ErrorCode.CLOSING_TIME_APPOINTMENT);
        }

        if (request.getTime().isBefore(LocalDateTime.now().plusMinutes(10))) {
            throw new AppException(ErrorCode.MINIMUM_SCHEDULE_TIME);
        }

        if (request.getDetails().isEmpty()) {
            throw new AppException(ErrorCode.DETAIL_LIST_EMPTY);
        }

        appointment.setContact(request.getContact());
        appointment.setTime(request.getTime());
        appointment.setCreateAt(LocalDateTime.now());
        appointment.setStatus(0);
        appointment.setDescription(request.getDescription());
        appointment = appointmentRepository.save(appointment);

        AppointmentResponse response = updateListDetailAppointment(appointment.getId(), request.getDetails(), false);

        String body = """   
                        <b>YÊU CẦU ĐẶT HẸN MỚI</b>
                       
                        <u>Khách hàng:</u>
                        <pre><code><b>Họ tên: </b>{0}\n
                        <b>SĐT: </b>{1}
                        <b>Địa chỉ: </b>{2}
                        <b>Email: </b>{3}</code></pre>
                        
                        <u>Thông tin chi tiết yêu cầu:</u>
                        <pre><code><b>Thời gian: </b>{4}
                        <b>Liên hệ: </b>{5}
                        <b>Ghi chú: </b>{6}</code></pre>
                        
                        <u>Dịch vụ đã chọn:</u>
                        <pre><code>{7}</code></pre>
                        
                        <i>Đã tạo lúc: {8}.</i>
                        """;

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm, 'ngày' dd/MM/yyyy");

        String serviceList = "";
        List<DetailAppointmentResponse> details = response.getDetails();
        if (!details.isEmpty()) {
            int count = 1;
            for (DetailAppointmentResponse detail : details) {
                String optionHtml = "";
                if (detail.getOptionName() != null && !detail.getOptionName().isEmpty()) {
                    optionHtml = " <i>("+detail.getOptionName()+")</i>";
                }
                serviceList += count +". "+detail.getServiceName() + optionHtml+"\n";
                count++;
            }
        } else {
            serviceList = "Trống\n";
        }

        String message = MessageFormat.format(body,
                customer.getName(),
                customer.getPhone()!=null ? customer.getPhone() : "Không có",
                customer.getAddress()!=null ? customer.getAddress().getAddress() : "Không có",
                response.getCustomer().getAccounts().stream().filter(a -> a.getStatus() == AccountStatus.CONFIRMED.getCode()).toList().get(0).getEmail(),
                response.getTime().format(formatter),
                response.getContact(),
                response.getDescription(),
                serviceList,
                response.getCreateAt().format(formatter)
                );

        var chatID = commonParameterRepository.findByKey("NEW_APPOINTMENT_NOTIFY").orElse(null);

        if (chatID != null) {
            try {
                telegramService.sendNotificationToAnUser(chatID.getValue(), message);
            } catch (Exception e) {
                log.error("Lỗi khi gửi thông báo Telegram");
                e.printStackTrace();
            }
        }

        return response;
    }

    @Transactional
    public AppointmentResponse updateListDetailAppointment(String id, List<DetailAppointmentCreationRequest> listDetailRequest, boolean hardUpdate) {
        Appointment appointment = appointmentRepository.findByIdFetchData(id)
                .filter(a -> a.getStatus() != AppointmentStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_EXIST));

        if (appointment.getStatus() == AppointmentStatus.MISSED.getCode() ||
                appointment.getStatus() == AppointmentStatus.COMPLETED.getCode() ||
                appointment.getStatus() == AppointmentStatus.CANCELLED.getCode()) {
            throw new AppException(ErrorCode.PAST_APPOINTMENT);
        }

        if (!hardUpdate) {
            if (appointment.getStatus() == AppointmentStatus.UPCOMING.getCode()) {
                throw new AppException(ErrorCode.CONFIRMED_APPOINTMENT);
            }
        }

        if (listDetailRequest.isEmpty()) {
            throw new AppException(ErrorCode.DETAIL_LIST_EMPTY);
        }

        List<DetailAppointment> currentListDetail = detailAppointmentRepository.findAllByAppointmentId(appointment.getId());

        List<DetailAppointment> newListDetail = new ArrayList<>();

        for (DetailAppointmentCreationRequest detail : listDetailRequest) {
            DetailAppointment detailAppointment = new DetailAppointment();
            detailAppointment.setAppointmentId(appointment.getId());

            Service service = serviceRepository.findById(detail.getServiceId())
                    .filter(s -> s.getStatus() != ServiceStatus.DELETED.getCode())
                    .orElseThrow(() -> new AppException(ErrorCode.SERVICE_NOT_EXISTS));

            if (service.getStatus() == ServiceStatus.NOT_USE.getCode()) {
                throw new AppException(ErrorCode.SERVICE_NOT_IN_USE);
            }

            detailAppointment.setService(service);
            detailAppointment.setServiceName(service.getName());

            if (detail.getOptionId() != null && !detail.getOptionId().isEmpty()) {
                Options option = optionRepository.findById(detail.getOptionId())
                        .filter(o -> o.getStatus() != OptionStatus.DELETED.getCode())
                        .orElseThrow(() -> new AppException(ErrorCode.OPTION_NOT_EXISTS));

                if (option.getStatus() == OptionStatus.NOT_USE.getCode()) {
                    throw new AppException(ErrorCode.OPTION_NOT_IN_USE);
                }

                detailAppointment.setOption(option);
                detailAppointment.setOptionName(option.getName());
            }

            newListDetail.add(detailAppointment);
        }

        newListDetail = detailAppointmentRepository.saveAll(newListDetail);
        detailAppointmentRepository.deleteAll(currentListDetail);

        AppointmentResponse response = appointmentMapper.toResponse(appointment);
        response.setDetails(newListDetail.stream().map(detailAppointmentMapper::toResponse).toList());
        return response;
    }

    @Transactional
    public AppointmentResponse updateAppointment(String id, AppointmentUpdateRequest request, boolean hardUpdate) {
        Appointment appointment = appointmentRepository.findByIdFetchData(id)
                .filter(a -> a.getStatus() != AppointmentStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_EXIST));

        if (appointment.getStatus() == AppointmentStatus.MISSED.getCode() ||
                appointment.getStatus() == AppointmentStatus.COMPLETED.getCode() ||
                appointment.getStatus() == AppointmentStatus.CANCELLED.getCode()) {
            throw new AppException(ErrorCode.PAST_APPOINTMENT);
        }

        if (request.getDetails().isEmpty()) {
            throw new AppException(ErrorCode.DETAIL_LIST_EMPTY);
        }

        if (!hardUpdate) {
            if (appointment.getStatus() == AppointmentStatus.UPCOMING.getCode()) {
                throw new AppException(ErrorCode.CONFIRMED_APPOINTMENT);
            }
            String uid = getUUIDFromJwt();
            if (!uid.equals(appointment.getCustomer().getId())) {
                throw new AppException(ErrorCode.NOT_YOUR_APPOINTMENT);

            }
        }

        String startStr = commonParameterRepository.findByKey("OPENING_TIME").get().getValue();
        String endStr = commonParameterRepository.findByKey("CLOSING_TIME").get().getValue();

        LocalTime openingTime = null;
        LocalTime closingTime = null;

        try {
            openingTime = LocalTime.parse(startStr, DateTimeFormatter.ofPattern("HH:mm"));
            closingTime = LocalTime.parse(endStr, DateTimeFormatter.ofPattern("HH:mm"));
        } catch (DateTimeParseException e) {
            e.printStackTrace();
            throw new AppException(ErrorCode.INVALID_TIME_FORMAT);
        }

        LocalTime selectedTime = request.getTime().toLocalTime();

        if (selectedTime.isBefore(openingTime) || selectedTime.isAfter(closingTime)) {
            throw new AppException(ErrorCode.CLOSING_TIME_APPOINTMENT);
        }

        appointment.setTime(request.getTime());
        appointment.setDescription(request.getDescription());
        appointment.setContact(request.getContact());

        if (appointment.getAdvisor() == null) {
            String uid = getUUIDFromJwt();
            if (!uid.equals(appointment.getCustomer().getId())) {
                User advisor = userRepository.findById(uid).orElse(null);
                appointment.setAdvisor(advisor);
            }
        }

        appointmentRepository.save(appointment);

        return updateListDetailAppointment(id, request.getDetails(), hardUpdate);
    }

    public Boolean updateAppointmentStatus(String id, int status){
        Appointment appointment = appointmentRepository.findById(id)
                .filter(a -> a.getStatus() != AppointmentStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_EXIST));

        if (appointment.getAdvisor() == null) {
            String uid = getUUIDFromJwt();
            if (!uid.equals(appointment.getCustomer().getId())) {
                User advisor = userRepository.findById(uid).orElse(null);
                appointment.setAdvisor(advisor);
            }
        }

        if (appointment.getStatus() == AppointmentStatus.MISSED.getCode() ||
                appointment.getStatus() == AppointmentStatus.COMPLETED.getCode() ||
                appointment.getStatus() == AppointmentStatus.CANCELLED.getCode()) {
            throw new AppException(ErrorCode.PAST_APPOINTMENT);
        }

        if (status == AppointmentStatus.UPCOMING.getCode()) {
            if (appointment.getStatus() != AppointmentStatus.PENDING_CONFIRM.getCode()) {
                throw new AppException(ErrorCode.CONFIRMED_APPOINTMENT);
            } else {
                appointment.setStatus(AppointmentStatus.UPCOMING.getCode());

                List<Account> acc = appointment.getCustomer().getAccounts()
                        .stream()
                        .filter(a -> a.getStatus() == AccountStatus.CONFIRMED.getCode())
                        .toList();
                if (!acc.isEmpty()) {
                    String facilityName = commonParameterRepository.findByKey("FACILITY_NAME").get().getValue();

                    String body = """
                            <p>Xin chào <strong>{0}</strong>,</p>
                            <p>Yêu cầu đặt hẹn vào lúc {1} của bạn đã được xác nhận!</p>
                            <p><u>Thông tin chi tiết lịch hẹn:</u></p>
                            <ul>
                                <li><b>Thời gian:</b> {2}</li>
                                <li><b>Địa chỉ:</b> {3}</li>
                                <li><b>Liên hệ:</b> {4}</li>
                                <li><b>Ghi chú của khách hàng:</b><br> {5}</li>
                            </ul>
                            
                            <p><u>Dịch vụ đã chọn:</u></p>
                            <ul>
                            {7}
                            </ul>
                            <p>Xin cảm ơn.</p>
                            <p>{6},<br><i>Trân trọng.</i></p>
                            """;

                    // 0 là tên customer, 1 là creatAt, 2 là time, 3 địa chỉ cơ sở, 4 là liên hệ, 5 là ghi chú
                    String customerName = appointment.getCustomer().getName();

                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm, 'ngày' dd/MM/yyyy");
                    String createAt = appointment.getCreateAt().format(formatter);
                    String time = appointment.getTime().format(formatter);

                    String facilityAddress = commonParameterRepository.findByKey("FACILITY_ADDRESS").get().getValue();
                    String facilityPhone = commonParameterRepository.findByKey("FACILITY_PHONE_NUMBER").get().getValue();
                    String description =  appointment.getDescription().isEmpty() ? "Không có ghi chú." : appointment.getDescription().replace("\n", "<br>");;

                    String services = "";
                    List<DetailAppointment> details = detailAppointmentRepository.findAllByAppointmentId(appointment.getId());
                    if (!details.isEmpty()) {
                        for (DetailAppointment detail : details) {
                            String optionHtml = "";
                            if (detail.getOptionName() != null && !detail.getOptionName().isEmpty()) {
                                optionHtml = "<i>("+detail.getOptionName()+")</i>";
                            }
                            services += "<li><b>"+detail.getServiceName()+"</b> "+optionHtml+"</li>";
                        }
                    }

                    String htmlBody = MessageFormat.format(body, customerName, createAt, time, facilityAddress, facilityPhone, description, facilityName, services);

                    emailSenderService.sendHtmlEmail(acc.getFirst().getEmail(), "[" + facilityName.toUpperCase() + "] THÔNG BÁO ĐẶT HẸN", htmlBody);
                }
            }
        } else if (status < 1 || status > 4) {
            throw new AppException(ErrorCode.INVALID_STATUS);
        } else {
            appointment.setStatus(status);
        }

        appointmentRepository.save(appointment);
        return true;
    }

    public Boolean customerCancelAppointment(String id){
        String uid = getUUIDFromJwt();

        Appointment appointment = appointmentRepository.findByIdFetchData(id)
                .filter(a -> a.getStatus() != AppointmentStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_EXIST));

        if (!appointment.getCustomer().getId().equals(uid)) {
            throw new AppException(ErrorCode.NOT_YOUR_APPOINTMENT);
        }

        if (appointment.getStatus() == AppointmentStatus.MISSED.getCode() ||
                appointment.getStatus() == AppointmentStatus.COMPLETED.getCode() ||
                appointment.getStatus() == AppointmentStatus.CANCELLED.getCode()) {
            throw new AppException(ErrorCode.PAST_APPOINTMENT);
        }

        if (appointment.getStatus() == AppointmentStatus.PENDING_CONFIRM.getCode() ||
            appointment.getStatus() == AppointmentStatus.UPCOMING.getCode()) {
            appointment.setStatus(AppointmentStatus.CANCELLED.getCode());
            appointmentRepository.save(appointment);

            String title = appointment.getStatus() == AppointmentStatus.PENDING_CONFIRM.getCode() ?
                    "KHÁCH HÀNG HỦY YÊU CẦU ĐẶT HẸN" : "KHÁCH HÀNG HỦY LỊCH HẸN ĐÃ XÁC NHẬN";

            String body = """   
                        <b>{0}</b>
                       
                        <u>Khách hàng:</u>
                        <pre><code><b>Họ tên: </b>{1}\n
                        <b>SĐT: </b>{2}
                        <b>Địa chỉ: </b>{3}
                        <b>Email: </b>{4}</code></pre>
                        
                        <u>Thông tin chi tiết yêu cầu:</u>
                        <pre><code><b>Thời gian: </b>{5}
                        <b>Liên hệ: </b>{6}
                        <b>Ghi chú: </b>{7}</code></pre>
                        
                        <u>Dịch vụ đã chọn:</u>
                        <pre><code>{8}</code></pre>
                        
                        <i>Đã tạo lúc: {9}.</i>
                        <i>Đã hủy lúc: {10}.</i>
                        """;

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm, 'ngày' dd/MM/yyyy");

            List<DetailAppointment> details = detailAppointmentRepository.findAllByAppointmentId(appointment.getId());

            String serviceList = "";
            if (!details.isEmpty()) {
                int count = 1;
                for (DetailAppointment detail : details) {
                    String optionHtml = "";
                    if (detail.getOptionName() != null && !detail.getOptionName().isEmpty()) {
                        optionHtml = " <i>("+detail.getOptionName()+")</i>";
                    }
                    serviceList += count +". "+detail.getServiceName() + optionHtml+"\n";
                    count++;
                }
            } else {
                serviceList = "Trống\n";
            }

            User customer = appointment.getCustomer();

            String message = MessageFormat.format(body,
                    title,
                    customer.getName(),
                    customer.getPhone()!=null ? customer.getPhone() : "Không có",
                    customer.getAddress()!=null ? customer.getAddress().getAddress() : "Không có",
                    appointment.getCustomer().getAccounts().stream().filter(a -> a.getStatus() == AccountStatus.CONFIRMED.getCode()).toList().get(0).getEmail(),
                    appointment.getTime().format(formatter),
                    appointment.getContact(),
                    appointment.getDescription(),
                    serviceList,
                    appointment.getCreateAt().format(formatter),
                    LocalDateTime.now().format(formatter)
            );

            var chatID = commonParameterRepository.findByKey("APPOINTMENT_NOTIFY").orElse(null);

            if (chatID != null) {
                try {
                    telegramService.sendNotificationToAnUser(chatID.getValue(), message);
                } catch (Exception e) {
                    log.error("Lỗi khi gửi thông báo Telegram");
                    e.printStackTrace();
                }
            }

            return true;
        } else {
            throw new AppException(ErrorCode.INVALID_STATUS);
        }
    }

    public void deleteappointment(String id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_EXIST));
        appointmentRepository.delete(appointment);
    }
}
