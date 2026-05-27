package com.aptis.listening.controller;

import com.aptis.listening.dto.SubmissionRequest;
import com.aptis.listening.dto.SubmissionResponse;
import com.aptis.listening.dto.TestDto;
import com.aptis.listening.model.Submission;
import com.aptis.listening.model.TestEntity;
import com.aptis.listening.service.TestService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tests")
@CrossOrigin(origins = "*") // Allow frontend development on alternative ports
public class TestController {

    private final TestService testService;

    public TestController(TestService testService) {
        this.testService = testService;
    }

    @GetMapping
    public ResponseEntity<List<TestDto>> getAllTests() {
        List<TestDto> tests = testService.getAllTests().stream()
                .map(TestDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tests);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestDto> getTestById(@PathVariable Long id) {
        TestEntity test = testService.getTestById(id);
        return ResponseEntity.ok(TestDto.fromEntity(test));
    }

    @GetMapping("/{id}/raw")
    public ResponseEntity<TestEntity> getRawTestById(@PathVariable Long id) {
        TestEntity test = testService.getTestById(id);
        return ResponseEntity.ok(test);
    }

    @PostMapping
    public ResponseEntity<TestEntity> createTest(@Valid @RequestBody TestEntity test) {
        TestEntity created = testService.createTest(test);
        return ResponseEntity.status(201).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TestEntity> updateTest(
            @PathVariable Long id,
            @Valid @RequestBody TestEntity test) {
        TestEntity updated = testService.updateTest(id, test);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTest(@PathVariable Long id) {
        testService.deleteTest(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<SubmissionResponse> submitTest(
            @PathVariable Long id,
            @Valid @RequestBody SubmissionRequest request) {
        SubmissionResponse response = testService.submitTest(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/submissions")
    public ResponseEntity<List<Submission>> getSubmissions(@PathVariable Long id) {
        List<Submission> submissions = testService.getSubmissionsByTestId(id);
        return ResponseEntity.ok(submissions);
    }
}
