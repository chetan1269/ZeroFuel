package com.zerofuel;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * ZeroFuel Backend — Spring Boot 3.x entry point.
 *
 * @EnableScheduling powers:
 *   - OTP expiry cleanup cron job (OtpCleanupService)
 *   - Future: IoT telemetry polling, late-return notifier
 */
@SpringBootApplication
@EnableScheduling
public class ZerofuelApplication {

    public static void main(String[] args) {
        SpringApplication.run(ZerofuelApplication.class, args);
    }
}
