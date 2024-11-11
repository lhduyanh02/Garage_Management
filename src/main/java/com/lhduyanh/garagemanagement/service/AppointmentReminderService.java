package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.entity.Account;
import com.lhduyanh.garagemanagement.entity.Appointment;
import com.lhduyanh.garagemanagement.entity.DetailAppointment;
import com.lhduyanh.garagemanagement.entity.User;
import com.lhduyanh.garagemanagement.enums.AccountStatus;
import com.lhduyanh.garagemanagement.repository.AppointmentRepository;
import com.lhduyanh.garagemanagement.repository.CommonParameterRepository;
import com.lhduyanh.garagemanagement.repository.DetailAppointmentRepository;
import jakarta.annotation.PostConstruct;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.text.MessageFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AppointmentReminderService {

    AppointmentRepository appointmentRepository;
    CommonParameterRepository commonParameterRepository;
    EmailSenderService emailSenderService;

    List<Appointment> appointments = new CopyOnWriteArrayList<>();


    public AppointmentReminderService(AppointmentRepository appointmentRepository, CommonParameterRepository commonParameterRepository, DetailAppointmentRepository detailAppointmentRepository, EmailSenderService emailSenderService) {
        this.appointmentRepository = appointmentRepository;
        this.commonParameterRepository = commonParameterRepository;
        this.emailSenderService = emailSenderService;
    }

    @PostConstruct
    public void loadAppointments() {
        appointments.clear();
        appointments.addAll(appointmentRepository.findAllUpcomingAppointments());
    }

    public void refreshListAppointments() {
        appointments.clear();
        appointments.addAll(appointmentRepository.findAllUpcomingAppointments());
        log.info("\n\n\nREFRESH LIST APPOINTMENT");
    }

    @Scheduled(fixedRate = 60000)
    public void checkListAppointments() {
        LocalDateTime now = LocalDateTime.now().truncatedTo(ChronoUnit.MINUTES);

        for (Appointment appointment : appointments) {
            if (appointment.getTime().truncatedTo(ChronoUnit.MINUTES).isEqual(now.plusMinutes(10))) {
                log.warn("\n\nGUI THONG BAO CUOC HEN");
                log.info(appointment.getCustomer().getName());
                sendReminderEmail(appointment);
            }
        }
    }

    private void sendReminderEmail(Appointment appointment) {
        // GUI EMAIL THONG BAO
        List<Account> acc = appointment.getCustomer().getAccounts()
                .stream()
                .filter(a -> a.getStatus() == AccountStatus.CONFIRMED.getCode())
                .toList();

        if (!acc.isEmpty()) {
            String facilityName = commonParameterRepository.findByKey("FACILITY_NAME").get().getValue();

            String body = """
                            <p>Xin chào <strong>{0}</strong>,</p>
                            <p>Bạn có lịch hẹn làm dịch vụ diễn ra trong 10 phút nữa.</p>
                            <p><u>Thông tin chi tiết lịch hẹn:</u></p>
                            <ul>
                                <li><b>Thời gian:</b> {1}</li>
                                <li><b>Địa chỉ:</b> {2}</li>
                                <li><b>Liên hệ:</b> {3}</li>
                                <li><b>Ghi chú:</b><br> {4}</li>
                            </ul>
                            <p><u>Thông tin cố vấn dịch vụ:</u></p>
                            <ul>
                                <li><b>Họ tên:</b> {5}</li>
                                <li><b>Số điện thoại:</b> {6}</li>
                                <li><b>Email:</b> {7}</li>
                            </ul>
                            
                            <p>Mọi thắc mắc vui lòng liên hệ <b>{8}</b>. Xin cảm ơn.</p>
                            <p>{9},<br><i>Trân trọng.</i></p>
                            """;

            String customerName = appointment.getCustomer().getName();
            String contact = appointment.getContact();
            if (contact == null || contact.isEmpty()) {
                contact = "<i>Không có</i>";
            }

            String advisorName = appointment.getAdvisor().getName();
            String advisorPhone = appointment.getAdvisor().getPhone();
            if (advisorPhone == null || advisorPhone.isEmpty()) {
                advisorPhone = "<i>Không có</i>";
            }
            String advisorEmail = appointment.getAdvisor().getAccounts().stream().findFirst().get().getEmail();

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm, 'ngày' dd/MM/yyyy");
            String time = appointment.getTime().format(formatter);

            String facilityAddress = commonParameterRepository.findByKey("FACILITY_ADDRESS").get().getValue();
            String facilityPhone = commonParameterRepository.findByKey("FACILITY_PHONE_NUMBER").get().getValue();
            String description =  appointment.getDescription().isEmpty() ? "Không có ghi chú." : appointment.getDescription().replace("\n", "<br>");;

            /* 0. customer name
             * 1. time
             * 2. facility address
             * 3. contact
             * 4.description
             * 5. advisor name
             * 6. advisor phone
             * 7. advisor email
             * 8. facility phone
             * 9. Facility name */

            String htmlBody = MessageFormat.format(body,
                    customerName,
                    time,
                    facilityAddress,
                    contact,
                    description,
                    advisorName,
                    advisorPhone,
                    advisorEmail,
                    facilityPhone,
                    facilityName);

            emailSenderService.sendHtmlEmail(acc.getFirst().getEmail(), "[" + facilityName.toUpperCase() + "] NHẮC LỊCH ĐẶT HẸN", htmlBody);
        }

    }

}
