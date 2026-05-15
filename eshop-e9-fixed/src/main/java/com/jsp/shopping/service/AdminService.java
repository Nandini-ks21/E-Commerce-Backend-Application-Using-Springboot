package com.jsp.shopping.service;

import java.util.Map;

import com.jsp.shopping.dto.ProductDto;

public interface AdminService {

	Map<String, Object> saveProduct(ProductDto productDto);

	Map<String, Object> fetchAllProducts();

	Map<String, Object> deleteProduct(Long id);

	Map<String, Object> updateProduct(Long id, ProductDto productDto);

}
