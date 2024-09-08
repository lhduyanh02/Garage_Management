package com.lhduyanh.garagemanagement.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;

import org.thymeleaf.context.Context;

@Component
public class EmailSenderService {
    @Autowired
    private TemplateEngine templateEngine;
    @Autowired
    JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("duyanh0949072719@gmail.com");
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);

        mailSender.send(message);

        System.out.println("Mail sent successfully!");
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

        // Tạo một đối tượng MimeMessage
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

        // Thiết lập thông tin cho email
        helper.setTo(to);
        helper.setSubject("[CAR DETAILING] VERIFY YOUR EMAIL");
        helper.setText(htmlContent, true); // true để gửi email dưới dạng HTML

        // Gửi email
        mailSender.send(mimeMessage);
    }

}
