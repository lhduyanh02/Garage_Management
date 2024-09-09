package com.lhduyanh.garagemanagement.controller;

import com.lhduyanh.garagemanagement.dto.request.IntrospectRequest;
import com.lhduyanh.garagemanagement.service.AuthenticationService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.io.IOException;
import java.util.Objects;

@Controller
@Slf4j
public class PageController {
    @Autowired
    AuthenticationService authenticationService;
    @GetMapping("/")
    public String home(HttpServletRequest request){
        return pageAuthentication(request,"index2");
    }

    @GetMapping("/register")
    public String signup() {
        return "register-v2";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    public String pageAuthentication(HttpServletRequest request,String path){
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                // Check for a specific cookie by name
                if ("authToken".equals(cookie.getName())) {
                    String token = cookie.getValue();
                    if(!Objects.isNull(token) && authenticationService.introspect(
                            IntrospectRequest
                                    .builder()
                                    .token(token)
                                    .build()).isValid())
                        return path;
                }
            }
        }
        return "redirect:/login";
    }

}
