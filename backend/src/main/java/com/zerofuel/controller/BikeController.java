package com.zerofuel.controller;

import com.zerofuel.dto.response.BikeResponse;
import com.zerofuel.service.BikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import com.zerofuel.dto.response.QuoteResponse;

@RestController
@RequestMapping("/api/v1/bikes")
@RequiredArgsConstructor
public class BikeController {

    private final BikeService bikeService;

    @GetMapping("/{id}")
    public ResponseEntity<BikeResponse> getBikeById(@PathVariable Long id) {
        return ResponseEntity.ok(bikeService.getBikeById(id));
    }

    @GetMapping("/{id}/quote")
    public ResponseEntity<QuoteResponse> getQuote(
            @PathVariable Long id,
            @RequestParam Integer durationMinutes) {
        return ResponseEntity.ok(bikeService.getQuote(id, durationMinutes));
    }
}
