package com.zerofuel.controller;

import com.zerofuel.dto.request.BookingRequest;
import com.zerofuel.dto.request.PaymentConfirmRequest;
import com.zerofuel.dto.request.PickupRequest;
import com.zerofuel.dto.request.ReturnRequest;
import com.zerofuel.entity.Booking;
import com.zerofuel.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<Booking> createBooking(
            @AuthenticationPrincipal String phoneNumber,
            @Valid @RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingService.createBooking(phoneNumber, request));
    }

    @PostMapping("/{ref}/confirm-payment")
    public ResponseEntity<Booking> confirmPayment(
            @AuthenticationPrincipal String phoneNumber,
            @PathVariable String ref,
            @Valid @RequestBody PaymentConfirmRequest request) {
        return ResponseEntity.ok(bookingService.confirmPayment(phoneNumber, ref, request));
    }

    @PostMapping("/{ref}/pickup")
    public ResponseEntity<Booking> activateRental(
            @AuthenticationPrincipal String phoneNumber,
            @PathVariable String ref,
            @Valid @RequestBody PickupRequest request) {
        return ResponseEntity.ok(bookingService.activateRental(phoneNumber, ref, request));
    }

    @PostMapping("/{ref}/return")
    public ResponseEntity<Booking> initiateReturn(
            @AuthenticationPrincipal String phoneNumber,
            @PathVariable String ref,
            @ModelAttribute @Valid ReturnRequest request,
            @RequestParam(value = "conditionPhoto", required = false) MultipartFile conditionPhoto) {
        return ResponseEntity.ok(bookingService.initiateReturn(phoneNumber, ref, request, conditionPhoto));
    }

    @GetMapping("/active")
    public ResponseEntity<Booking> getActiveRental(@AuthenticationPrincipal String phoneNumber) {
        Booking activeBooking = bookingService.getActiveRental(phoneNumber);
        if (activeBooking == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(activeBooking);
    }

    @GetMapping("/my-history")
    public ResponseEntity<Page<Booking>> getMyRentalHistory(
            @AuthenticationPrincipal String phoneNumber,
            Pageable pageable) {
        return ResponseEntity.ok(bookingService.getMyRentalHistory(phoneNumber, pageable));
    }
}
