package com.jsp.shopping.service;

import java.util.Map;

public interface AuthService {

	Map<String, Object> login(String email, String password);

}
