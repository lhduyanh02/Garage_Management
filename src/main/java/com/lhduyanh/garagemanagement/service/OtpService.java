package com.lhduyanh.garagemanagement.service;

import com.lhduyanh.garagemanagement.entity.Account;
import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import com.lhduyanh.garagemanagement.repository.AccountRepository;
import com.lhduyanh.garagemanagement.repository.UserRepository;
import jakarta.mail.MessagingException;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@AllArgsConstructor
@Slf4j
public class OtpService {
    // Duration of waiting time for OTP verifying (Minute)
    final int duration = 10;

    AccountRepository accountRepository;
    UserRepository userRepository;
    EmailSenderService emailSenderService;

    public String generateOtp() {
        Random random = new Random();
        int randomInt = random.nextInt(999999);
        String otpCode = String.valueOf(randomInt);
        while (otpCode.length() < 6) {
            otpCode = "0" + otpCode;
        }
        return otpCode;
    }

    public Account createSendOtpCode(Account account) {
        String otpCode = generateOtp();

        account.setOtpCode(otpCode);
        account.setGeneratedAt(LocalDateTime.now());
        try {
            emailSenderService.sendOTPEmail(account.getEmail(), account.getUser().getName(), otpCode);
        } catch (MessagingException e) {
            throw new AppException(ErrorCode.EMAIL_SENDING_ERROR);
        }
        return accountRepository.save(account);
    }

    public boolean VerifyOtpCode(String email, String otpCode){
        var account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_EXISTED));

        if (otpCode.equals(account.getOtpCode()) &&
                Duration.between(account.getGeneratedAt(), LocalDateTime.now())
                        .getSeconds() < (duration * 60)) {
            return true;
        }
        return false;

//        if(otpOptional.isPresent()){
//            OTPCode otp = otpOptional.get();
//            String s = "";
//            s += "Email: " + otp.getEmail();
//            s += "\nGenerated Time: " + otp.getGeneratedTime();
//            s += "\nOTP Code: " + otp.getOtpCode();
//            s += "\nIs Verified: " + otp.isVerified();
//            log.info(s);
//
//            if(otp.getEmail().equals(email) && otp.getOtpCode().equals(otpCode)
//                    && Duration.between(otp.getGeneratedTime(),LocalDateTime.now()).getSeconds() <= (duration * 60)){
//                return true;
//            }
//            else
//            {
//                return false;
//            }
//        }
//        else
//        {
//            return false;
//        }
    }
}
