package com.moodrec.service;

import com.moodrec.dto.request.LoginRequest;
import com.moodrec.dto.request.RegisterRequest;
import com.moodrec.dto.response.AuthResponse;
import com.moodrec.model.User;
import com.moodrec.repository.UserRepository;
import com.moodrec.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException("Email already registered: " + request.getEmail());
        }
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .username(request.getUsername())
                .build();
        userRepository.save(user);
        return AuthResponse.builder()
                .token(jwtUtil.generateToken(user))
                .email(user.getEmail())
                .username(user.getUsername())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        return AuthResponse.builder()
                .token(jwtUtil.generateToken(user))
                .email(user.getEmail())
                .username(user.getUsername())
                .build();
    }
}
