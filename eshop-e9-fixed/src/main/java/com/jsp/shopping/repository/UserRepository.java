package com.jsp.shopping.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jsp.shopping.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

	boolean existsByMobileOrEmail(long mobile, String email);

	Optional<User> findByEmail(String email);

}
