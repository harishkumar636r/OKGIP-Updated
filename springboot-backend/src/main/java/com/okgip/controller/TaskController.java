package com.okgip.controller;

import com.okgip.entity.Task;
import com.okgip.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @GetMapping("/assigned/{employeeId}")
    public List<Task> getTasksAssignedTo(@PathVariable Long employeeId) {
        return taskRepository.findByAssignedToId(employeeId);
    }

    @PostMapping
    public Task createTask(@RequestBody Task task) {
        return taskRepository.save(task);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Task> updateTaskStatus(@PathVariable Long id, @RequestParam String status) {
        return taskRepository.findById(id).map(task -> {
            task.setStatus(status);
            return ResponseEntity.ok(taskRepository.save(task));
        }).orElse(ResponseEntity.notFound().build());
    }
}
