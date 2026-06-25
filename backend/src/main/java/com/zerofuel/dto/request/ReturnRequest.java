package com.zerofuel.dto.request;

import com.zerofuel.enums.BikeCondition;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReturnRequest {
    @NotBlank(message = "Hub QR code is required")
    private String qrCode;

    @NotNull(message = "Bike condition is required")
    private BikeCondition bikeCondition;
}
