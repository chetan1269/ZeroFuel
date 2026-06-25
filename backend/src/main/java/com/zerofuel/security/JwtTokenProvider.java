package com.zerofuel.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Stateless JWT utility: generates and validates tokens.
 *
 * Token subject = user's phone number (used as the unique identity key).
 * No refresh-token logic here; that belongs in a dedicated RefreshToken entity
 * for a future iteration.
 */
@Slf4j
@Component
public class JwtTokenProvider {

    private final SecretKey signingKey;
    private final long expirationMs;

    /**
     * @param secret       Must be at least 256 bits (32 chars). Inject from env/vault.
     * @param expirationMs Token lifetime in milliseconds (e.g., 86400000 = 24h).
     */
    public JwtTokenProvider(
        @Value("${zerofuel.jwt.secret}") String secret,
        @Value("${zerofuel.jwt.expiration-ms}") long expirationMs
    ) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    // ── Token Generation ──────────────────────────────────────────────────────

    /**
     * Creates a signed JWT for the given phone number.
     *
     * @param phoneNumber the authenticated user's phone number
     * @return compact serialised JWT string
     */
    public String generateToken(String phoneNumber) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
            .subject(phoneNumber)
            .issuedAt(now)
            .expiration(expiry)
            .signWith(signingKey, Jwts.SIG.HS256)
            .compact();
    }

    // ── Token Validation ──────────────────────────────────────────────────────

    /**
     * Validates the token's signature and expiration.
     *
     * @param token raw JWT string from the Authorization header
     * @return true if valid; false otherwise (logs the specific failure)
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("JWT expired: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.warn("Malformed JWT: {}", e.getMessage());
        } catch (SecurityException e) {
            log.warn("Invalid JWT signature: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }

    /**
     * Extracts the phone number (subject) from a valid token.
     * Call only after {@link #validateToken(String)} returns true.
     */
    public String getPhoneNumberFromToken(String token) {
        return parseClaims(token).getPayload().getSubject();
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    private Jws<Claims> parseClaims(String token) {
        return Jwts.parser()
            .verifyWith(signingKey)
            .build()
            .parseSignedClaims(token);
    }
}
