package com.jsp.shopping.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.jsp.shopping.dao.ProductDao;
import com.jsp.shopping.dto.ProductDto;
import com.jsp.shopping.entity.Product;
import com.jsp.shopping.exception.AlreadyExistsException;
import com.jsp.shopping.mapper.MyMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

	private final ProductDao productDao;
	private final MyMapper mapper;

	@Override
	public Map<String, Object> saveProduct(ProductDto productDto) {
		if (productDao.checkIfDuplicate(productDto.getName(), productDto.getCategory()))
			throw new AlreadyExistsException(
					productDto.getName() + " in " + productDto.getCategory() + " Already Exists");
		Product product = mapper.toProductEntity(productDto);
		productDao.saveProduct(product);
		return Map.of("message", product.getName() + " Added Success", "product", mapper.toProductDto(product));
	}

	@Override
	public Map<String, Object> fetchAllProducts() {
		List<Product> products=productDao.getProducts();
		return Map.of("message","Products Found","products",mapper.toProductDtoList(products));
	}

	@Override
	public Map<String, Object> deleteProduct(Long id) {
		Product product=productDao.findById(id);
		productDao.deleteById(id);
		return Map.of("message","Product Deleted Success","product",mapper.toProductDto(product));
	}

	@Override
	public Map<String, Object> updateProduct(Long id, ProductDto productDto) {
		productDao.findById(id);
		Product product=mapper.toProductEntity(productDto);
		product.setId(id);
		productDao.saveProduct(product);
		return Map.of("message","Product Updated Success","product",mapper.toProductDto(product));
	}

}
