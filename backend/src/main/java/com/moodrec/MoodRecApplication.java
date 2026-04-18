package com.moodrec;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class MoodRecApplication {
    public static void main(String[] args) {
        SpringApplication.run(MoodRecApplication.class, args);
    }
}
