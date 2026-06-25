package com.zerofuel.dto.response;

import com.zerofuel.enums.BikeStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BikeResponse {
    private Long id;
    private String registrationNumber;
    private String qrCode;
    private String modelName;
    private String brand;
    private Integer rangeKm;
    private Integer maxSpeedKmph;
    private Integer batteryPercentage;
    private String imageUrl;
    private BigDecimal perMinutePriceInr;
    private BigDecimal hourlyPriceInr;
    private BigDecimal dailyPriceInr;
    private BigDecimal weeklyPriceInr;
    private BigDecimal depositAmountInr;
    private BikeStatus status;
    
    // Summary of home hub
    private HubResponse homeHub;
}
