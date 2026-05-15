package com.jsp.shopping.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jsp.shopping.dto.LoginDto;
import com.jsp.shopping.service.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
	private final AuthService authService;

	@PostMapping("/login")
	public Map<String, Object> login(@RequestBody LoginDto dto) {
		return authService.login(dto.getEmail(),dto.getPassword());
	}
}
