package com.lhduyanh.garagemanagement.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OtpService {

    /*
    @Autowired
    OtpCodeRepository otpCodeRepository;

    public String generateOtp() {
        Random random = new Random();
        int randomInt = random.nextInt(999999);
        String otpCode = String.valueOf(randomInt);
        while (otpCode.length() < 6) {
            otpCode = "0" + otpCode;
        }

        return otpCode;
    }

    public String createOtpCode(String email) {
        OTPCode otp = new OTPCode();

        String otpCode = generateOtp();

        otp.setEmail(email);
        otp.setOtpCode(otpCode);
        otp.setGeneratedTime(LocalDateTime.now());

        otpCodeRepository.save(otp);
        return otpCode;
    }

    public boolean VerifyOtpCode(String email, String otpCode){
        Optional<OTPCode> otpOptional = otpCodeRepository.findByEmailAndOtpCodeAndIsVerifiedFalse(email, otpCode);
        if(otpOptional.isPresent()){
            OTPCode otp = otpOptional.get();
            String s = "";
            s += "Email: " + otp.getEmail();
            s += "\nGenerated Time: " + otp.getGeneratedTime();
            s += "\nOTP Code: " + otp.getOtpCode();
            s += "\nIs Verified: " + otp.isVerified();
            System.out.println(s);

            if(otp.getEmail().equals(email) && otp.getOtpCode().equals(otpCode) && Duration.between(otp.getGeneratedTime(),LocalDateTime.now()).getSeconds() <= 3600){
                return true;
            }
            else
            {
                return false;
            }
        }
        else
        {
            return false;
        }
    }

     */
}
