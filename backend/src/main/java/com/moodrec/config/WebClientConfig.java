package com.moodrec.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

@Configuration
public class WebClientConfig {

    @Value("${ml-service.base-url}")
    private String mlServiceBaseUrl;

    @Value("${ml-service.timeout-seconds}")
    private int timeoutSeconds;

    @Bean("mlWebClient")
    public WebClient mlWebClient(WebClient.Builder builder) {
        return builder
                .baseUrl(mlServiceBaseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .codecs(c -> c.defaultCodecs().maxInMemorySize(20 * 1024 * 1024)) // 20MB for images
                .build();
    }
}
