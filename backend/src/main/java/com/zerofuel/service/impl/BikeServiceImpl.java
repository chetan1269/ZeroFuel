package com.zerofuel.service.impl;

import com.zerofuel.dto.response.BikeResponse;
import com.zerofuel.dto.response.HubResponse;
import com.zerofuel.dto.response.QuoteResponse;
import com.zerofuel.entity.Bike;
import com.zerofuel.entity.Hub;
import com.zerofuel.exception.ResourceNotFoundException;
import com.zerofuel.repository.BikeRepository;
import com.zerofuel.service.BikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import com.zerofuel.enums.BikeStatus;

@Service
@RequiredArgsConstructor
public class BikeServiceImpl implements BikeService {

    private final BikeRepository bikeRepository;

    @Override
    public BikeResponse getBikeById(Long bikeId) {
        Bike bike = bikeRepository.findById(bikeId)
                .orElseThrow(() -> new ResourceNotFoundException("Bike not found"));
                
        Hub homeHub = bike.getHomeHub();
        HubResponse hubResponse = null;
        
        if (homeHub != null) {
            hubResponse = HubResponse.builder()
                    .id(homeHub.getId())
                    .name(homeHub.getName())
                    .address(homeHub.getAddress())
                    .city(homeHub.getCity())
                    .state(homeHub.getState())
                    .pincode(homeHub.getPincode())
                    .latitude(homeHub.getLatitude())
                    .longitude(homeHub.getLongitude())
                    .totalSlots(homeHub.getTotalSlots())
                    .isActive(homeHub.getIsActive())
                    .operatingHours(homeHub.getOperatingHours())
                    .imageUrl(homeHub.getImageUrl())
                    .build();
        }
                
        return BikeResponse.builder()
                .id(bike.getId())
                .registrationNumber(bike.getRegistrationNumber())
                .qrCode(bike.getQrCode())
                .modelName(bike.getModelName())
                .brand(bike.getBrand())
                .rangeKm(bike.getRangeKm())
                .maxSpeedKmph(bike.getMaxSpeedKmph())
                .batteryPercentage(bike.getBatteryPercentage())
                .imageUrl(bike.getImageUrl())
                .perMinutePriceInr(bike.getPerMinutePriceInr())
                .hourlyPriceInr(bike.getHourlyPriceInr())
                .dailyPriceInr(bike.getDailyPriceInr())
                .weeklyPriceInr(bike.getWeeklyPriceInr())
                .depositAmountInr(bike.getDepositAmountInr())
                .status(bike.getStatus())
                .homeHub(hubResponse)
                .build();
    }

    @Override
    public List<BikeResponse> getAvailableBikesByHubId(Long hubId) {
        List<Bike> bikes = bikeRepository.findByHomeHubIdAndStatus(hubId, BikeStatus.AVAILABLE);
        return bikes.stream().map(bike -> BikeResponse.builder()
                .id(bike.getId())
                .registrationNumber(bike.getRegistrationNumber())
                .qrCode(bike.getQrCode())
                .modelName(bike.getModelName())
                .brand(bike.getBrand())
                .rangeKm(bike.getRangeKm())
                .maxSpeedKmph(bike.getMaxSpeedKmph())
                .batteryPercentage(bike.getBatteryPercentage())
                .imageUrl(bike.getImageUrl())
                .perMinutePriceInr(bike.getPerMinutePriceInr())
                .hourlyPriceInr(bike.getHourlyPriceInr())
                .dailyPriceInr(bike.getDailyPriceInr())
                .weeklyPriceInr(bike.getWeeklyPriceInr())
                .depositAmountInr(bike.getDepositAmountInr())
                .status(bike.getStatus())
                .build()).collect(Collectors.toList());
    }

    @Override
    public QuoteResponse getQuote(Long bikeId, Integer durationMinutes) {
        Bike bike = bikeRepository.findById(bikeId)
                .orElseThrow(() -> new ResourceNotFoundException("Bike not found"));
                
        java.math.BigDecimal estimatedCost;
        String breakdown;
        
        if (durationMinutes >= 24 * 60) {
            int days = (int) Math.ceil(durationMinutes / (24.0 * 60));
            estimatedCost = bike.getDailyPriceInr().multiply(new java.math.BigDecimal(days));
            breakdown = days + " day(s) @ ₹" + bike.getDailyPriceInr() + "/day";
        } else if (durationMinutes >= 60) {
            int hours = (int) Math.ceil(durationMinutes / 60.0);
            estimatedCost = bike.getHourlyPriceInr().multiply(new java.math.BigDecimal(hours));
            breakdown = hours + " hour(s) @ ₹" + bike.getHourlyPriceInr() + "/hr";
        } else {
            estimatedCost = bike.getPerMinutePriceInr().multiply(new java.math.BigDecimal(durationMinutes));
            breakdown = durationMinutes + " minute(s) @ ₹" + bike.getPerMinutePriceInr() + "/min";
        }
        
        java.math.BigDecimal deposit = bike.getDepositAmountInr();
        java.math.BigDecimal total = estimatedCost.add(deposit);
        
        return QuoteResponse.builder()
                .bikeId(bikeId)
                .durationMinutes(durationMinutes)
                .estimatedCost(estimatedCost)
                .depositAmount(deposit)
                .totalAmountToPay(total)
                .breakdown(breakdown)
                .build();
    }
}
