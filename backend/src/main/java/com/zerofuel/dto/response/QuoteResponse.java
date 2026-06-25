package com.zerofuel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuoteResponse {
    private Long bikeId;
    private Integer durationMinutes;
    private BigDecimal estimatedCost;
    private BigDecimal depositAmount;
    private BigDecimal totalAmountToPay;
    private String breakdown;
}
