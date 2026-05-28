package com.aptis.listening.service;

import com.aptis.listening.dto.GradeWritingRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class WritingService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public WritingService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
    }

    public JsonNode gradeWriting(GradeWritingRequest request) {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            throw new RuntimeException("GEMINI_API_KEY is not configured on the backend.");
        }

        try {
            String prompt = buildPrompt(request);

            // Construct Gemini request body
            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);

            Map<String, Object> content = new HashMap<>();
            content.put("parts", Collections.singletonList(part));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", Collections.singletonList(content));

            // Set system config to return JSON
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("responseMimeType", "application/json");
            requestBody.put("generationConfig", generationConfig);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;

            JsonNode responseNode = restTemplate.postForObject(url, entity, JsonNode.class);

            if (responseNode != null && responseNode.has("candidates") && responseNode.get("candidates").isArray()) {
                JsonNode candidate = responseNode.get("candidates").get(0);
                if (candidate.has("content") && candidate.get("content").has("parts")) {
                    String jsonText = candidate.get("content").get("parts").get(0).get("text").asText();
                    return objectMapper.readTree(jsonText);
                }
            }

            throw new RuntimeException("Unexpected response structure from Gemini API");

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to grade writing: " + e.getMessage());
        }
    }

    private String buildPrompt(GradeWritingRequest request) throws Exception {
        Map<String, Object> testData = request.getTestData();
        
        String part1 = testData.containsKey("part1") ? objectMapper.writeValueAsString(testData.get("part1")) : "{}";
        String part2 = testData.containsKey("part2") ? objectMapper.writeValueAsString(testData.get("part2")) : "{}";
        String part3 = testData.containsKey("part3") ? objectMapper.writeValueAsString(testData.get("part3")) : "{}";
        String part4 = testData.containsKey("part4") ? objectMapper.writeValueAsString(testData.get("part4")) : "{}";
        
        String answers = request.getAnswers() != null ? objectMapper.writeValueAsString(request.getAnswers()) : "{}";

        return "You are an expert Cambridge/British Council examiner grading an Aptis Writing test.\n" +
                "Evaluate the candidate's performance based on their answers to the 4 parts.\n\n" +
                "Test Prompts:\n" +
                "Part 1 (Word-level): " + part1 + "\n" +
                "Part 2 (Short text): " + part2 + "\n" +
                "Part 3 (Social chat): " + part3 + "\n" +
                "Part 4 (Emails): " + part4 + "\n\n" +
                "Candidate Answers:\n" + answers + "\n\n" +
                "Provide your evaluation in the following JSON structure exactly:\n" +
                "{\n" +
                "  \"overallSummary\": \"A brief paragraph summarizing their overall performance.\",\n" +
                "  \"strengths\": [\"point 1\", \"point 2\", \"point 3\"],\n" +
                "  \"weaknesses\": [\"point 1\", \"point 2\"],\n" +
                "  \"improvements\": [\"actionable advice 1\", \"actionable advice 2\"],\n" +
                "  \"partScores\": {\n" +
                "    \"part1\": {\"score\": \"X/5\", \"feedback\": \"feedback for part 1\"},\n" +
                "    \"part2\": {\"score\": \"X/5\", \"feedback\": \"feedback for part 2\"},\n" +
                "    \"part3\": {\"score\": \"X/5\", \"feedback\": \"feedback for part 3\"},\n" +
                "    \"part4\": {\"score\": \"X/5\", \"feedback\": \"feedback for part 4\"}\n" +
                "  },\n" +
                "  \"estimatedCEFR\": \"A1/A2/B1/B2/C\"\n" +
                "}";
    }
}
