package com.jsp.shopping.service;

import java.util.Map;

import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.jsp.shopping.dao.UserDao;
import com.jsp.shopping.entity.User;
import com.jsp.shopping.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

	private final UserDao userDao;
	private final PasswordEncoder encoder;
	private final JwtService jwtService;

	@Override
	public Map<String, Object> login(String email, String password) {
		User user = userDao.findByEmail(email);
		if (!encoder.matches(password, user.getPassword()))
			throw new AuthorizationDeniedException("Invalid Password");

		String token = jwtService.generateToken(user.getEmail(), user.getRole());
		return Map.of("message", "Login Successful", "token", token, "role", user.getRole());
	}

}
