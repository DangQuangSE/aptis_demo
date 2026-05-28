package com.aptis.listening.controller;

import com.aptis.listening.dto.GradeWritingRequest;
import com.aptis.listening.service.WritingService;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/writing")
@CrossOrigin(origins = "*")
public class WritingController {

    private final WritingService writingService;

    public WritingController(WritingService writingService) {
        this.writingService = writingService;
    }

    @PostMapping("/grade")
    public ResponseEntity<?> gradeWriting(@RequestBody GradeWritingRequest request) {
        try {
            JsonNode result = writingService.gradeWriting(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            // Return JSON error structure to match what frontend expects
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage().replace("\"", "\\\"") + "\"}");
        }
    }
}
