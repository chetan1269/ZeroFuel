package com.zerofuel.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PickupRequest {
    @NotBlank(message = "QR code is required")
    private String qrCode;
}
