package com.lhduyanh.garagemanagement.configuration;

import com.lhduyanh.garagemanagement.repository.CommonParameterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Autowired
    CommonParameterRepository commonParameterRepository;

    @Bean
    public WebClient webClient() {
        String communicationKey = commonParameterRepository.findByKey("TELEGRAM_COMMUNICATION_KEY").get().getValue();

        return WebClient.builder()
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("Communication-Key", communicationKey)
                .build();
    }

}
