package com.jsp.shopping.dao;

import org.springframework.stereotype.Repository;

import com.jsp.shopping.entity.User;
import com.jsp.shopping.exception.DataNotFoundException;
import com.jsp.shopping.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class UserDao {

	private final UserRepository userRepository;

	public boolean checkIfExists(long mobile, String email) {
		return userRepository.existsByMobileOrEmail(mobile, email);
	}
	
	public User findByEmail(String email) {
		return userRepository.findByEmail(email).orElseThrow(() -> new DataNotFoundException("Invalid Email"));
	}

	public void saveAdmin(User admin) {
		admin.setRole("ADMIN");
		userRepository.save(admin);
	}
}
