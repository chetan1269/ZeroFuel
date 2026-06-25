package com.zerofuel.repository;

import com.zerofuel.entity.Hub;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HubRepository extends JpaRepository<Hub, Long> {

    List<Hub> findByIsActiveTrue();

    /**
     * Returns active hubs within the given radius (km), sorted nearest-first.
     */
    @Query(value = """
        SELECT * FROM hubs h
        WHERE h.is_active = true
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
    List<Hub> findNearbyActiveHubs(
        @Param("lat") double lat,
        @Param("lon") double lon,
        @Param("radiusKm") double radiusKm
    );
}
