package com.zerofuel.service;

import com.zerofuel.dto.response.HubResponse;

import java.util.List;

public interface HubService {
    List<HubResponse> getNearbyHubs(double latitude, double longitude, double radiusKm);
    HubResponse getHubById(Long hubId);
}
