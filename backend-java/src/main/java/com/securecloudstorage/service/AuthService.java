package com.securecloudstorage.service;

import com.securecloudstorage.dto.AuthResponse;
import com.securecloudstorage.dto.LoginRequest;
import com.securecloudstorage.dto.RegisterRequest;
import com.securecloudstorage.model.User;
import com.securecloudstorage.repository.UserRepository;
import com.securecloudstorage.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("User already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPublicKey(request.getPublicKey());

        User savedUser = userRepository.save(user);
        String token = jwtUtil.generateToken(savedUser.getId());

        return buildAuthResponse(token, savedUser);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getId());
        return buildAuthResponse(token, user);
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private AuthResponse buildAuthResponse(String token, User user) {
        AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
                user.getId(), user.getUsername(), user.getPublicKey()
        );
        return new AuthResponse(token, userInfo);
    }
}
