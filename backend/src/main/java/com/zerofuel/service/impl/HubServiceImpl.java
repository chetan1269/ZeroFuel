package com.zerofuel.service.impl;

import com.zerofuel.dto.response.HubResponse;
import com.zerofuel.entity.Hub;
import com.zerofuel.enums.BikeStatus;
import com.zerofuel.exception.ResourceNotFoundException;
import com.zerofuel.repository.HubRepository;
import com.zerofuel.service.HubService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HubServiceImpl implements HubService {

    private final HubRepository hubRepository;

    @Override
    public List<HubResponse> getNearbyHubs(double latitude, double longitude, double radiusKm) {
        List<Hub> hubs = hubRepository.findNearbyActiveHubs(latitude, longitude, radiusKm);
        
        return hubs.stream().map(hub -> {
            long availableBikes = hub.getBikes().stream()
                    .filter(b -> b.getStatus() == BikeStatus.AVAILABLE)
                    .count();
                    
            // Approximate distance calculation using Haversine formula
            double distance = calculateHaversineDistance(latitude, longitude, hub.getLatitude().doubleValue(), hub.getLongitude().doubleValue());
            
            return HubResponse.builder()
                    .id(hub.getId())
                    .name(hub.getName())
                    .address(hub.getAddress())
                    .city(hub.getCity())
                    .state(hub.getState())
                    .pincode(hub.getPincode())
                    .latitude(hub.getLatitude())
                    .longitude(hub.getLongitude())
                    .totalSlots(hub.getTotalSlots())
                    .isActive(hub.getIsActive())
                    .operatingHours(hub.getOperatingHours())
                    .imageUrl(hub.getImageUrl())
                    .availableCount(availableBikes)
                    .distance(distance)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public HubResponse getHubById(Long hubId) {
        Hub hub = hubRepository.findById(hubId)
                .orElseThrow(() -> new ResourceNotFoundException("Hub not found"));
                
        long availableBikes = hub.getBikes().stream()
                .filter(b -> b.getStatus() == BikeStatus.AVAILABLE)
                .count();
                
        return HubResponse.builder()
                .id(hub.getId())
                .name(hub.getName())
                .address(hub.getAddress())
                .city(hub.getCity())
                .state(hub.getState())
                .pincode(hub.getPincode())
                .latitude(hub.getLatitude())
                .longitude(hub.getLongitude())
                .totalSlots(hub.getTotalSlots())
                .isActive(hub.getIsActive())
                .operatingHours(hub.getOperatingHours())
                .imageUrl(hub.getImageUrl())
                .availableCount(availableBikes)
                .build();
    }
    
    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the earth in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
