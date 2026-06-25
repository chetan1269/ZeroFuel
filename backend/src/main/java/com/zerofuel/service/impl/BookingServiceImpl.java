package com.zerofuel.service.impl;

import com.zerofuel.dto.request.BookingRequest;
import com.zerofuel.dto.request.PaymentConfirmRequest;
import com.zerofuel.dto.request.PickupRequest;
import com.zerofuel.dto.request.ReturnRequest;
import com.zerofuel.entity.Bike;
import com.zerofuel.entity.Booking;
import com.zerofuel.entity.User;
import com.zerofuel.enums.BikeCondition;
import com.zerofuel.enums.BikeStatus;
import com.zerofuel.enums.BookingStatus;
import com.zerofuel.enums.RentalPlanType;
import com.zerofuel.exception.BadRequestException;
import com.zerofuel.exception.ResourceNotFoundException;
import com.zerofuel.exception.UnauthorizedException;
import com.zerofuel.repository.BikeRepository;
import com.zerofuel.repository.BookingRepository;
import com.zerofuel.repository.UserRepository;
import com.zerofuel.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final BikeRepository bikeRepository;

    @Override
    @Transactional
    public Booking createBooking(String phoneNumber, BookingRequest request) {
        User user = getUser(phoneNumber);
        Bike bike = getBike(request.getBikeId());

        if (bike.getStatus() != BikeStatus.AVAILABLE) {
            throw new BadRequestException("Bike is not available for booking");
        }

        BigDecimal rentalAmount = request.getRentalPlan() == RentalPlanType.DAILY 
                ? bike.getDailyPriceInr() 
                : bike.getWeeklyPriceInr();
                
        BigDecimal totalCharged = rentalAmount.add(bike.getDepositAmountInr());

        Booking booking = Booking.builder()
                .bookingReference("ZF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .user(user)
                .bike(bike)
                .rentalPlan(request.getRentalPlan())
                .rentalAmountInr(rentalAmount)
                .depositCollectedInr(bike.getDepositAmountInr())
                .totalChargedInr(totalCharged)
                .status(BookingStatus.PENDING_PAYMENT)
                .build();

        // Lock the bike
        bike.setStatus(BikeStatus.RESERVED);
        bikeRepository.save(bike);

        return bookingRepository.save(booking);
    }

    @Override
    @Transactional
    public Booking confirmPayment(String phoneNumber, String bookingRef, PaymentConfirmRequest request) {
        Booking booking = getBooking(phoneNumber, bookingRef);
        
        if (booking.getStatus() != BookingStatus.PENDING_PAYMENT) {
            throw new BadRequestException("Booking is not pending payment");
        }
        
        booking.setPaymentGatewayOrderId(request.getOrderId());
        booking.setPaymentGatewayPaymentId(request.getPaymentId());
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setConfirmedAt(LocalDateTime.now());
        
        return bookingRepository.save(booking);
    }

    @Override
    @Transactional
    public Booking activateRental(String phoneNumber, String bookingRef, PickupRequest request) {
        Booking booking = getBooking(phoneNumber, bookingRef);
        
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new BadRequestException("Booking is not confirmed");
        }
        
        if (!booking.getBike().getQrCode().equals(request.getQrCode())) {
            throw new BadRequestException("Invalid QR code scanned for pickup");
        }
        
        booking.setStatus(BookingStatus.ACTIVE);
        booking.setRentalStartTime(LocalDateTime.now());
        booking.setPickupHub(booking.getBike().getHomeHub());
        
        // Duration logic
        int days = booking.getRentalPlan() == RentalPlanType.DAILY ? 1 : 7;
        booking.setRentalEndTime(LocalDateTime.now().plusDays(days));
        
        // Update bike status
        Bike bike = booking.getBike();
        bike.setStatus(BikeStatus.RENTED);
        bikeRepository.save(bike);
        
        return bookingRepository.save(booking);
    }

    @Override
    @Transactional
    public Booking initiateReturn(String phoneNumber, String bookingRef, ReturnRequest request, MultipartFile conditionPhoto) {
        Booking booking = getBooking(phoneNumber, bookingRef);
        
        if (booking.getStatus() != BookingStatus.ACTIVE) {
            throw new BadRequestException("Only active rentals can be returned");
        }
        
        // Simplified: assuming any valid hub QR string is accepted for MVP
        if (request.getQrCode() == null || request.getQrCode().isEmpty()) {
            throw new BadRequestException("Hub QR code is required for return");
        }

        booking.setBikeConditionAtReturn(request.getBikeCondition());
        booking.setActualReturnTime(LocalDateTime.now());
        
        // Handle mock photo upload
        if (conditionPhoto != null && !conditionPhoto.isEmpty()) {
            booking.setConditionPhotoUrl("https://mock-storage.com/" + UUID.randomUUID() + "-return.jpg");
        }
        
        // Process deposit refund based on condition
        BigDecimal refundAmount = booking.getDepositCollectedInr();
        if (request.getBikeCondition() == BikeCondition.MAJOR_DAMAGE) {
            refundAmount = BigDecimal.ZERO;
            booking.setSettlementNotes("Major damage detected, full deposit withheld");
        } else if (request.getBikeCondition() == BikeCondition.MINOR_DAMAGE) {
            refundAmount = refundAmount.multiply(new BigDecimal("0.5")); // 50% deduction
            booking.setSettlementNotes("Minor damage detected, 50% deposit withheld");
        } else {
            booking.setSettlementNotes("Bike returned in good condition");
        }
        
        booking.setDepositRefundedInr(refundAmount);
        booking.setStatus(BookingStatus.COMPLETED);
        
        // Add CO2 savings logic
        User user = booking.getUser();
        user.setTotalCo2SavedGrams(user.getTotalCo2SavedGrams() + 1500L); // Add 1.5kg for each trip
        user.setTotalMoneySavedPaise(user.getTotalMoneySavedPaise() + (booking.getRentalAmountInr().longValue() * 100)); // Just a mock calculation
        userRepository.save(user);
        
        // Update bike status
        Bike bike = booking.getBike();
        bike.setStatus(BikeStatus.AVAILABLE);
        bikeRepository.save(bike);
        
        return bookingRepository.save(booking);
    }

    @Override
    public Booking getActiveRental(String phoneNumber) {
        User user = getUser(phoneNumber);
        return bookingRepository.findByUserIdAndStatusIn(user.getId(), 
                java.util.List.of(BookingStatus.CONFIRMED, BookingStatus.ACTIVE))
                .stream().findFirst().orElse(null);
    }

    @Override
    public Page<Booking> getMyRentalHistory(String phoneNumber, Pageable pageable) {
        User user = getUser(phoneNumber);
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
    }
    
    private User getUser(String phoneNumber) {
        return userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
    
    private Bike getBike(Long bikeId) {
        return bikeRepository.findById(bikeId)
                .orElseThrow(() -> new ResourceNotFoundException("Bike not found"));
    }
    
    private Booking getBooking(String phoneNumber, String bookingRef) {
        Booking booking = bookingRepository.findByBookingReference(bookingRef)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
                
        if (!booking.getUser().getPhoneNumber().equals(phoneNumber)) {
            throw new UnauthorizedException("Booking does not belong to user");
        }
        
        return booking;
    }
}
