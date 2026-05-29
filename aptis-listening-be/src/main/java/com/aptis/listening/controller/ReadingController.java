package com.aptis.listening.controller;

import com.aptis.listening.dto.GradeReadingRequest;
import com.aptis.listening.service.ReadingService;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.util.FileCopyUtils;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/reading")
@CrossOrigin(origins = "*")
public class ReadingController {

    private final ReadingService readingService;

    public ReadingController(ReadingService readingService) {
        this.readingService = readingService;
    }

    @GetMapping("/data")
    public ResponseEntity<?> getReadingData() {
        try {
            ClassPathResource resource = new ClassPathResource("scraped_data/reading_all.json");
            byte[] bdata = FileCopyUtils.copyToByteArray(resource.getInputStream());
            String data = new String(bdata, StandardCharsets.UTF_8);
            return ResponseEntity.ok().header("Content-Type", "application/json").body(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"Failed to load reading data\"}");
        }
    }

    @PostMapping("/grade")
    public ResponseEntity<?> gradeReading(@RequestBody GradeReadingRequest request) {
        try {
            JsonNode result = readingService.gradeReading(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            // Return JSON error structure to match what frontend expects
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage().replace("\"", "\\\"") + "\"}");
        }
    }
}
