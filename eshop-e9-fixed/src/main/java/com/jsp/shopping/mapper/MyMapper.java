package com.jsp.shopping.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.jsp.shopping.dto.ProductDto;
import com.jsp.shopping.dto.UserDto;
import com.jsp.shopping.entity.Product;
import com.jsp.shopping.entity.User;

@Component
public class MyMapper {

	public User toUserEntity(UserDto dto) {
		User user = new User();
		user.setName(dto.getName());
		user.setEmail(dto.getEmail());
		user.setPassword(dto.getPassword());
		user.setMobile(dto.getMobile());
		user.setActive(true);
		// role is set by UserDao.saveAdmin()
		return user;
	}

	public Product toProductEntity(ProductDto productDto) {
		Product product = new Product();
		product.setId(productDto.getId());
		product.setName(productDto.getName());
		product.setPrice(productDto.getPrice());
		product.setCategory(productDto.getCategory());
		product.setDescription(productDto.getDescription());
		product.setImageLink(productDto.getImageLink());
		product.setStock(productDto.getStock());
		// createdTime is handled by @CreationTimestamp
		return product;
	}

	public ProductDto toProductDto(Product product) {
		ProductDto dto = new ProductDto();
		dto.setId(product.getId());
		dto.setName(product.getName());
		dto.setPrice(product.getPrice());
		dto.setCategory(product.getCategory());
		dto.setDescription(product.getDescription());
		dto.setImageLink(product.getImageLink());
		dto.setStock(product.getStock());
		return dto;
	}

	public List<ProductDto> toProductDtoList(List<Product> products) {
		return products.stream()
				.map(this::toProductDto)
				.collect(Collectors.toList());
	}
}
