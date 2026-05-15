package com.jsp.shopping.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
	@NotEmpty(message = "Name is Required")
	private String name;
	@NotEmpty(message = "Email is Required")
	@Email(message = "Email should be in proper format")
	private String email;
	@NotEmpty(message = "Password is Required")
	private String password;
	@NotNull(message = "Mobile is Required")
	private Long mobile;
}