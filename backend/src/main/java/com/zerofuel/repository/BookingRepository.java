package com.zerofuel.repository;

import com.zerofuel.entity.Booking;
import com.zerofuel.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingReference(String bookingReference);

    /** Used to load the active rental screen for a user. */
    Optional<Booking> findByUserIdAndStatus(Long userId, BookingStatus status);

    /** Paginated rental history for the Profile screen. */
    Page<Booking> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /** All bookings for a user in specific statuses (e.g., for analytics). */
    List<Booking> findByUserIdAndStatusIn(Long userId, List<BookingStatus> statuses);
}
