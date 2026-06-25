package com.zerofuel.dto.request;

import com.zerofuel.enums.RentalPlanType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingRequest {
    @NotNull(message = "Bike ID is required")
    private Long bikeId;

    @NotNull(message = "Rental plan is required")
    private RentalPlanType rentalPlan;
}
