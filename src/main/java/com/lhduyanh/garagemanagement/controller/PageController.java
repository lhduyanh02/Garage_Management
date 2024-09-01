package com.lhduyanh.garagemanagement.controller;

import jakarta.annotation.security.PermitAll;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {   // for routing pages

    @PermitAll
    @GetMapping("/")
    public String home() {
        return "index2";
    }

    @GetMapping("/dangky")
    public String signup() {
        return "register-v2";
    }
}
