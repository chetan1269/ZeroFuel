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
public class HubResponse {
    private Long id;
    private String name;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Integer totalSlots;
    private Boolean isActive;
    private String operatingHours;
    private String imageUrl;
    
    // Computed fields
    private long availableCount;
    private Double distance; // Can be populated if queried with lat/lon
}
