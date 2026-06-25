package com.zerofuel.service;

import com.zerofuel.dto.response.BikeResponse;

import java.util.List;
import com.zerofuel.dto.response.QuoteResponse;

public interface BikeService {
    BikeResponse getBikeById(Long bikeId);
    List<BikeResponse> getAvailableBikesByHubId(Long hubId);
    QuoteResponse getQuote(Long bikeId, Integer durationMinutes);
}
