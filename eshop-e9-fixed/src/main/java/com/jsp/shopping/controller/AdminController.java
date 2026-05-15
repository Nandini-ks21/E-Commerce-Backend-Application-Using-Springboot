package com.jsp.shopping.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.jsp.shopping.dto.ProductDto;
import com.jsp.shopping.service.AdminService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admins")
@RequiredArgsConstructor
public class AdminController {

	private final AdminService adminService;

	@PostMapping("/products")
	@ResponseStatus(HttpStatus.CREATED)
	@PreAuthorize("hasRole('ADMIN')")
	public Map<String, Object> saveProduct(@Valid @RequestBody ProductDto productDto) {
		return adminService.saveProduct(productDto);
	}

	@GetMapping("/products")
	@ResponseStatus(HttpStatus.OK)
	@PreAuthorize("hasRole('ADMIN')")
	public Map<String, Object> fetchAll() {
		return adminService.fetchAllProducts();
	}

	@DeleteMapping("/products/{id}")
	@ResponseStatus(HttpStatus.OK)
	@PreAuthorize("hasRole('ADMIN')")
	public Map<String, Object> deleteProduct(@PathVariable Long id) {
		return adminService.deleteProduct(id);
	}

	@PutMapping("/products/{id}")
	@ResponseStatus(HttpStatus.OK)
	@PreAuthorize("hasRole('ADMIN')")
	public Map<String, Object> updateProduct(@Valid @RequestBody ProductDto productDto, @PathVariable Long id) {
		return adminService.updateProduct(id,productDto);
	}

}
