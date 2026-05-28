package com.aptis.listening.dto;

import java.util.Map;

public class GradeWritingRequest {
    private Map<String, Object> answers;
    private Map<String, Object> testData;

    public Map<String, Object> getAnswers() {
        return answers;
    }

    public void setAnswers(Map<String, Object> answers) {
        this.answers = answers;
    }

    public Map<String, Object> getTestData() {
        return testData;
    }

    public void setTestData(Map<String, Object> testData) {
        this.testData = testData;
    }
}
