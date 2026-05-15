package com.jsp.shopping.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.jsp.shopping.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
	private final UserService userService;

	@GetMapping("/products")
	public Map<String, Object> viewProducts(@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "10") int size, @RequestParam(defaultValue = "id") String sort,
			@RequestParam(defaultValue = "false") boolean desc, @RequestParam(defaultValue = "") String name,
			@RequestParam(defaultValue =  "") String category, @RequestParam(defaultValue = "0") double lower,
			@RequestParam(defaultValue = "100000") double higher) {
		return userService.getProducts(page,size,sort,desc,name,category,lower,higher);
	}
}
