package com.okgip.dto;

import com.okgip.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private Role role;
    private Long employeeId;
    private String name;
}
