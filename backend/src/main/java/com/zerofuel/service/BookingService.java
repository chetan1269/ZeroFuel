package com.zerofuel.service;

import com.zerofuel.dto.request.BookingRequest;
import com.zerofuel.dto.request.PaymentConfirmRequest;
import com.zerofuel.dto.request.PickupRequest;
import com.zerofuel.dto.request.ReturnRequest;
import com.zerofuel.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface BookingService {
    Booking createBooking(String phoneNumber, BookingRequest request);
    Booking confirmPayment(String phoneNumber, String bookingRef, PaymentConfirmRequest request);
    Booking activateRental(String phoneNumber, String bookingRef, PickupRequest request);
    Booking initiateReturn(String phoneNumber, String bookingRef, ReturnRequest request, MultipartFile conditionPhoto);
    Booking getActiveRental(String phoneNumber);
    Page<Booking> getMyRentalHistory(String phoneNumber, Pageable pageable);
}
