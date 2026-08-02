package com.okgip.controller;

import com.okgip.entity.LeaveRequest;
import com.okgip.repository.LeaveRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/leave")
@CrossOrigin(origins = "*", maxAge = 3600)
public class LeaveController {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @GetMapping
    public List<LeaveRequest> getAllLeaveRequests() {
        return leaveRequestRepository.findAll();
    }

    @GetMapping("/employee/{employeeId}")
    public List<LeaveRequest> getEmployeeLeaveRequests(@PathVariable Long employeeId) {
        return leaveRequestRepository.findByEmployeeId(employeeId);
    }

    @PostMapping("/apply")
    public LeaveRequest applyLeave(@RequestBody LeaveRequest leaveRequest) {
        leaveRequest.setStatus("PENDING");
        return leaveRequestRepository.save(leaveRequest);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<LeaveRequest> updateLeaveStatus(@PathVariable Long id, @RequestParam String status, @RequestParam Long managerId) {
        return leaveRequestRepository.findById(id).map(leave -> {
            leave.setStatus(status);
            leave.setApprovedBy(managerId);
            return ResponseEntity.ok(leaveRequestRepository.save(leave));
        }).orElse(ResponseEntity.notFound().build());
    }
}
