package com.okgip.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ai")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AiController {

    @GetMapping("/recommendations/{employeeId}")
    public ResponseEntity<Map<String, Object>> getAiTrainingRecommendations(@PathVariable Long employeeId) {
        Map<String, Object> response = new HashMap<>();
        response.put("employeeId", employeeId);
        response.put("currentSkills", List.of("React", "Node.js", "SQL"));
        response.put("missingSkills", List.of("Docker", "AWS", "Kubernetes"));
        response.put("recommendedCourses", List.of(
                Map.of("title", "Docker Essentials", "level", "Beginner", "provider", "Coursera"),
                Map.of("title", "AWS Cloud Practitioner", "level", "Intermediate", "provider", "Udemy"),
                Map.of("title", "Kubernetes Basics", "level", "Advanced", "provider", "Internal")
        ));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/predictive-gap/{departmentId}")
    public ResponseEntity<Map<String, Object>> getPredictiveSkillGap(@PathVariable Long departmentId) {
        Map<String, Object> response = new HashMap<>();
        response.put("departmentId", departmentId);
        response.put("horizon", "6 Months");
        response.put("prediction", "Within the next 6 months your department will require Kubernetes and Cloud Infrastructure skills.");
        response.put("recommendedActions", List.of(
                "Upskill 3 Frontend developers in Docker and Cloud Native architecture",
                "Enroll DevOps lead in Kubernetes Certified Administrator (CKA)"
        ));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/career-path/{employeeId}")
    public ResponseEntity<Map<String, Object>> getCareerPath(@PathVariable Long employeeId) {
        Map<String, Object> response = new HashMap<>();
        response.put("employeeId", employeeId);
        response.put("currentRole", "Software Engineer");
        response.put("targetRole", "Senior Full-Stack Cloud Architect");
        response.put("milestones", List.of("React", "Node", "Docker", "AWS", "DevOps"));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/chatbot")
    public ResponseEntity<Map<String, String>> chatWithAi(@RequestBody Map<String, String> request) {
        String prompt = request.getOrDefault("message", "");
        String reply;
        if (prompt.toLowerCase().contains("cloud")) {
            reply = "I recommend taking 'AWS Cloud Practitioner' followed by 'Docker Essentials' and 'Kubernetes Basics'. Here is your custom learning path!";
        } else {
            reply = "Based on your current skill profile, completing our AI-recommended training modules will reduce your knowledge gap by 42% over the next quarter.";
        }

        Map<String, String> response = new HashMap<>();
        response.put("reply", reply);
        return ResponseEntity.ok(response);
    }
}
