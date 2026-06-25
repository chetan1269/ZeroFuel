package com.zerofuel.security;

import com.zerofuel.entity.User;
import com.zerofuel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Loads user identity for Spring Security from the database.
 * Username here is the phone number — no password is stored or used.
 */
@Service
@RequiredArgsConstructor
public class ZerofuelUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String phoneNumber) throws UsernameNotFoundException {
        User user = userRepository.findByPhoneNumber(phoneNumber)
            .orElseThrow(() -> new UsernameNotFoundException(
                "No user found with phone: " + phoneNumber
            ));

        // All authenticated users start with ROLE_USER.
        // Admin roles can be added via a separate roles table in a later iteration.
        return new org.springframework.security.core.userdetails.User(
            user.getPhoneNumber(),
            "",  // No password — JWT validates identity
            List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
    }
}
