package com.okgip.controller;

import com.okgip.dto.JwtResponse;
import com.okgip.dto.LoginRequest;
import com.okgip.entity.Employee;
import com.okgip.entity.Role;
import com.okgip.entity.User;
import com.okgip.repository.EmployeeRepository;
import com.okgip.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Optional<User> userOpt = userRepository.findByEmail(loginRequest.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Error: User not found!");
        }

        User user = userOpt.get();
        // Simple authentication demonstration (In production use BCryptPasswordEncoder and Spring Security AuthenticationManager)
        if (!user.getPassword().equals(loginRequest.getPassword())) {
            return ResponseEntity.badRequest().body("Error: Invalid credentials!");
        }

        Employee employee = user.getEmployee();
        String name = employee != null ? employee.getFirstName() + " " + employee.getLastName() : "User";
        Long employeeId = employee != null ? employee.getId() : null;

        String dummyJwtToken = "eyJhbGciOiJIUzI1NiJ9.okgip_mock_token_" + user.getId();

        JwtResponse response = JwtResponse.builder()
                .token(dummyJwtToken)
                .type("Bearer")
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .employeeId(employeeId)
                .name(name)
                .build();

        return ResponseEntity.ok(response);
    }
}
