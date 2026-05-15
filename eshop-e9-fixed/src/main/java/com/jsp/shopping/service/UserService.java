package com.jsp.shopping.service;

import java.util.Map;

public interface UserService {

	Map<String, Object> getProducts(int page, int size, String sort, boolean desc, String name, String category,
			double lower, double higher);

}
