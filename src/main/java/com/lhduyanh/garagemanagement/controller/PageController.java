package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.exception.AppException;
import com.lhduyanh.garagemanagement.exception.ErrorCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import static java.util.Objects.isNull;

@Controller
public class PageController {

//    @PreAuthorize("@securityExpression.hasPermission({'DASHBOARD'})")
    @GetMapping("/")
    public String home() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return "redirect:/login";
            }
        } catch (NullPointerException e) {
            return "redirect:/login";
        }
        return "index2";
    }

    @GetMapping("/register")
    public String signup() {
        return "register-v2";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }
}
