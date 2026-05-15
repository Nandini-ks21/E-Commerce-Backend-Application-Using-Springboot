package com.jsp.shopping.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class LoginDto {
	@NotEmpty(message = "Email is Required")
	@Email(message = "Enter Proper Email")
	private String email;
	@NotEmpty(message = "Password is Required")
	private String password;
}
