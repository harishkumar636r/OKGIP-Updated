package com.okgip.controller;

import com.okgip.entity.Employee;
import com.okgip.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/employees")
@CrossOrigin(origins = "*", maxAge = 3600)
public class EmployeeController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id) {
        return employeeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/department/{departmentId}")
    public List<Employee> getEmployeesByDepartment(@PathVariable Long departmentId) {
        return employeeRepository.findByDepartmentId(departmentId);
    }
}
