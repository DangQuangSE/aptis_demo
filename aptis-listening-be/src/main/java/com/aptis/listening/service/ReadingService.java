package com.aptis.listening.service;

import com.aptis.listening.dto.GradeReadingRequest;
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
import java.util.Map;

@Service
public class ReadingService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public ReadingService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
    }

    public JsonNode gradeReading(GradeReadingRequest request) {
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
            throw new RuntimeException("Failed to evaluate reading: " + e.getMessage());
        }
    }

    private String buildPrompt(GradeReadingRequest request) throws Exception {
        String testDataStr = objectMapper.writeValueAsString(request.getTestData());
        String answersStr = request.getAnswers() != null ? objectMapper.writeValueAsString(request.getAnswers()) : "{}";

        return "You are an expert English tutor evaluating a student's Aptis Reading test.\n" +
                "You are provided with the Test Data (which contains the reading passages, questions, and options) and the Student's Answers.\n\n" +
                "Test Data:\n" + testDataStr + "\n\n" +
                "Student Answers (JSON object mapping question IDs to the student's selected answer or ordered number):\n" + answersStr + "\n\n" +
                "Your task is to:\n" +
                "1. Identify the correct answer for each question based on the text.\n" +
                "2. Compare it to the student's answer.\n" +
                "3. Calculate the total score (number of correct answers).\n" +
                "4. Estimate their CEFR reading level (A1, A2, B1, B2, C).\n" +
                "5. Provide a brief overall summary.\n" +
                "6. For EVERY INCORRECT answer, provide a detailed explanation of why the student's answer is wrong and why the correct answer is right based on the reading passage.\n\n" +
                "Provide your evaluation exactly in the following JSON structure:\n" +
                "{\n" +
                "  \"overallSummary\": \"Summary of performance.\",\n" +
                "  \"totalScore\": \"X / Y\",\n" +
                "  \"estimatedCEFR\": \"B1\",\n" +
                "  \"explanations\": [\n" +
                "    {\n" +
                "      \"questionId\": \"p1_q1\",\n" +
                "      \"userAnswer\": \"noisy\",\n" +
                "      \"correctAnswer\": \"comfortable\",\n" +
                "      \"explanation\": \"The sentence says 'so we decided to stay for an extra night'. This means they liked it, so 'comfortable' is the logical choice.\"\n" +
                "    }\n" +
                "  ]\n" +
                "}";
    }
}
