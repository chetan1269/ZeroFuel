package com.zerofuel.controller;

import com.zerofuel.dto.response.HubResponse;
import com.zerofuel.service.HubService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.zerofuel.dto.response.BikeResponse;
import com.zerofuel.service.BikeService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hubs")
@RequiredArgsConstructor
public class HubController {

    private final HubService hubService;
    private final BikeService bikeService;

    @GetMapping("/nearby")
    public ResponseEntity<List<HubResponse>> getNearbyHubs(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "10.0") double radiusKm) {
        return ResponseEntity.ok(hubService.getNearbyHubs(latitude, longitude, radiusKm));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HubResponse> getHubById(@PathVariable Long id) {
        return ResponseEntity.ok(hubService.getHubById(id));
    }

    @GetMapping("/{id}/bikes")
    public ResponseEntity<List<BikeResponse>> getAvailableBikesAtHub(@PathVariable Long id) {
        return ResponseEntity.ok(bikeService.getAvailableBikesByHubId(id));
    }
}
