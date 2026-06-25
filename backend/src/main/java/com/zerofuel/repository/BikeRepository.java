package com.zerofuel.repository;

import com.zerofuel.entity.Bike;
import com.zerofuel.enums.BikeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BikeRepository extends JpaRepository<Bike, Long> {

    Optional<Bike> findByQrCode(String qrCode);

    List<Bike> findByHomeHubIdAndStatus(Long hubId, BikeStatus status);

    /**
     * Finds available bikes within a radius using the Haversine formula.
     * Returns bikes sorted by distance ascending for the "nearby" list.
     *
     * @param lat      user's current latitude
     * @param lon      user's current longitude
     * @param radiusKm search radius in kilometres
     */
    @Query(value = """
        SELECT b.* FROM bikes b
        JOIN hubs h ON b.home_hub_id = h.id
        WHERE b.status = 'AVAILABLE'
          AND h.is_active = true
          AND (
            6371 * ACOS(
              COS(RADIANS(:lat)) * COS(RADIANS(h.latitude))
              * COS(RADIANS(h.longitude) - RADIANS(:lon))
              + SIN(RADIANS(:lat)) * SIN(RADIANS(h.latitude))
            )
          ) <= :radiusKm
        ORDER BY (
            6371 * ACOS(
              COS(RADIANS(:lat)) * COS(RADIANS(h.latitude))
              * COS(RADIANS(h.longitude) - RADIANS(:lon))
              + SIN(RADIANS(:lat)) * SIN(RADIANS(h.latitude))
            )
        ) ASC
        """, nativeQuery = true)
    List<Bike> findAvailableBikesNearby(
        @Param("lat") double lat,
        @Param("lon") double lon,
        @Param("radiusKm") double radiusKm
    );
}
