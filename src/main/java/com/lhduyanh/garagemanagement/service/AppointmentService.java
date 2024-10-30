package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.configuration.SecurityExpression;
import com.lhduyanh.garagemanagement.dto.request.AppointmentCreationRequest;
import com.lhduyanh.garagemanagement.dto.request.AppointmentUpdateRequest;
import com.lhduyanh.garagemanagement.dto.request.DetailAppointmentCreationRequest;
import com.lhduyanh.garagemanagement.dto.response.AccountSimpleResponse;
import com.lhduyanh.garagemanagement.dto.response.AppointmentResponse;
import com.lhduyanh.garagemanagement.dto.response.DetailAppointmentResponse;
import com.lhduyanh.garagemanagement.dto.response.UserWithAccountsResponse;
import com.lhduyanh.garagemanagement.entity.*;
import com.lhduyanh.garagemanagement.enums.*;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.mapper.AppointmentMapper;
import com.lhduyanh.garagemanagement.mapper.DetailAppointmentMapper;
import com.lhduyanh.garagemanagement.repository.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

import java.text.Collator;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
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

    AppointmentMapper appointmentMapper;
    DetailAppointmentMapper detailAppointmentMapper;
    private final Collator vietnameseCollator;
    private final SecurityExpression securityExpression;

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
                .sorted(Comparator.comparing(AppointmentResponse::getTime))
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
                .sorted(Comparator.comparing(AppointmentResponse::getTime))
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
                .sorted(Comparator.comparing(AppointmentResponse::getTime))
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
    public AppointmentResponse newAppointment(AppointmentCreationRequest appointmentRequest) {
        Appointment appointment = new Appointment();

        appointmentRepository.findAllByCustomerId(appointmentRequest.getCustomerId())
                .stream()
                .filter(a -> a.getStatus() != AppointmentStatus.DELETED.getCode())
                .peek(a -> {
                    if (a.getStatus() == AppointmentStatus.PENDING_CONFIRM.getCode()) {
                        log.error("having pending appointment");
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

        if (appointmentRequest.getAdvisorId() != null && !appointmentRequest.getAdvisorId().isEmpty()) {
            User advisor = userRepository.findByIdFullInfo(appointmentRequest.getAdvisorId())
                    .filter(u -> (u.getStatus() != UserStatus.DELETED.getCode() && u.getStatus() != UserStatus.NOT_CONFIRM.getCode()))
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
            if (advisor.getStatus() == UserStatus.BLOCKED.getCode()) {
                throw new AppException(ErrorCode.BLOCKED_USER);
            }

            appointment.setAdvisor(advisor);
        }

        if (appointmentRequest.getTime().isBefore(LocalDateTime.now().plusMinutes(10))) {
            throw new AppException(ErrorCode.MINIMUM_SCHEDULE_TIME);
        }

        if (appointmentRequest.getDetails().isEmpty()) {
            throw new AppException(ErrorCode.DETAIL_LIST_EMPTY);
        }

        appointment.setTime(appointmentRequest.getTime());
        appointment.setCreateAt(LocalDateTime.now());
        appointment.setStatus(appointmentRequest.getStatus());
        appointment.setDescription(appointmentRequest.getDescription());
        appointment = appointmentRepository.save(appointment);

        AppointmentResponse response = updateListDetailAppointment(appointment.getId(), appointmentRequest.getDetails(), true);

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

        if (request.getTime().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.INVALID_TIME);
        }

        if (request.getDetails().isEmpty()) {
            throw new AppException(ErrorCode.DETAIL_LIST_EMPTY);
        }

        if (!hardUpdate) {
            if (appointment.getStatus() == AppointmentStatus.UPCOMING.getCode()) {
                throw new AppException(ErrorCode.CONFIRMED_APPOINTMENT);
            }
        }

        appointment.setTime(request.getTime());
        appointment.setDescription(request.getDescription());

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

    public Boolean updateAppointmentStatus(String id, int status) {
        Appointment appointment = appointmentRepository.findById(id)
                .filter(a -> a.getStatus() != AppointmentStatus.DELETED.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.APPOINTMENT_NOT_EXIST));

        if (appointment.getStatus() == AppointmentStatus.MISSED.getCode() ||
                appointment.getStatus() == AppointmentStatus.COMPLETED.getCode() ||
                appointment.getStatus() == AppointmentStatus.CANCELLED.getCode()) {
            throw new AppException(ErrorCode.PAST_APPOINTMENT);
        }

        if (status == AppointmentStatus.UPCOMING.getCode()) {
            if (appointment.getStatus() != AppointmentStatus.PENDING_CONFIRM.getCode()) {
                throw new AppException(ErrorCode.CONFIRMED_APPOINTMENT);
            }
            else {
                appointment.setStatus(AppointmentStatus.UPCOMING.getCode());
                appointmentRepository.save(appointment);
                return true;
            }
        } else if (status < 1 || status > 4) {
            throw new AppException(ErrorCode.INVALID_STATUS);
        } else {
            appointment.setStatus(status);
            appointmentRepository.save(appointment);
            return true;
        }
    }

}
