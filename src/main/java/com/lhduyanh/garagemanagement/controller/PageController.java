package com.lhduyanh.garagemanagement.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {   // for routing pages
    @GetMapping("/")
    public String home() {
        return "index2";
    }

    @GetMapping("/dangky")
    public String signup() {
        return "register-v2";
    }
}
