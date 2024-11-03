package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.repository.CommonParameterRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;

import org.thymeleaf.context.Context;

@Component
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmailSenderService {
    @Autowired
    TemplateEngine templateEngine;
    @Autowired
    JavaMailSender mailSender;
    @Autowired
    CommonParameterRepository commonParameterRepository;

    @Value("${spring.mail.username}")
    private String emailName;

    @Async
    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(emailName);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);

        mailSender.send(message);

        System.out.println("Mail sent successfully!");
    }

    @Async
    public void sendHtmlEmail(String to, String subject, String body){
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);

            mailSender.send(message);

            System.out.println("HTML mail sent successfully!");
        } catch (MessagingException e) {
            throw new AppException(ErrorCode.EMAIL_SENDING_ERROR);
        }

    }

    public String getHtmlContent(String Hoten, String otp) {
        Context context = new Context();
        context.setVariable("hoten", Hoten);
        context.setVariable("otpcode", otp);
        return templateEngine.process("OTPMailTemplate", context);
    }

    @Async
    public void sendOTPEmail(String to, String hoten, String otp) throws MessagingException {
        // Tạo nội dung HTML
        String htmlContent = getHtmlContent(hoten, otp);

        String facilityName = commonParameterRepository.findByKey("FACILITY_NAME").get().getValue().toUpperCase();

        // Tạo một đối tượng MimeMessage
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

        // Thiết lập thông tin cho email
        helper.setTo(to);
        helper.setSubject("["+facilityName+"] VERIFY YOUR EMAIL");
        helper.setText(htmlContent, true); // true để gửi email dưới dạng HTML

        // Gửi email
        mailSender.send(mimeMessage);
    }

}
