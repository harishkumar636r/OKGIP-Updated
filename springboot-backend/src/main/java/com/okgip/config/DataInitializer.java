package com.okgip.config;

import com.okgip.entity.*;
import com.okgip.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final SkillRepository skillRepository;

    public DataInitializer(UserRepository userRepository,
                           EmployeeRepository employeeRepository,
                           DepartmentRepository departmentRepository,
                           SkillRepository skillRepository) {
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.skillRepository = skillRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            // Create Departments
            Department eng = departmentRepository.save(Department.builder().name("Engineering").code("ENG").description("Software development and cloud platform").build());
            Department hr = departmentRepository.save(Department.builder().name("Human Resources").code("HR").description("Talent acquisition and employee wellness").build());

            // Create Skills
            skillRepository.save(Skill.builder().name("React").category("Frontend").description("Modern web user interfaces").build());
            skillRepository.save(Skill.builder().name("Spring Boot").category("Backend").description("Java enterprise web APIs").build());
            skillRepository.save(Skill.builder().name("Docker").category("DevOps").description("Containerization").build());

            // Admin User
            User adminUser = userRepository.save(User.builder().email("admin@okgip.com").password("admin123").role(Role.ROLE_ADMIN).build());
            employeeRepository.save(Employee.builder().user(adminUser).firstName("System").lastName("Admin").department(eng).designation("System Administrator").experienceYears(8).build());

            // Manager User
            User managerUser = userRepository.save(User.builder().email("manager@okgip.com").password("manager123").role(Role.ROLE_MANAGER).build());
            employeeRepository.save(Employee.builder().user(managerUser).firstName("Sarah").lastName("Jenkins").department(eng).designation("Engineering Manager").experienceYears(6).build());

            // Employee User
            User empUser = userRepository.save(User.builder().email("employee@okgip.com").password("employee123").role(Role.ROLE_EMPLOYEE).build());
            employeeRepository.save(Employee.builder().user(empUser).firstName("Alex").lastName("Rivera").department(eng).designation("Frontend Developer").experienceYears(3).build());

            System.out.println("OKGIP Spring Boot Backend initial seed data populated successfully!");
        }
    }
}
