package com.aptis.listening.dto;

import java.time.LocalDateTime;
import java.util.Map;

public record SubmissionResponse(
    Long submissionId,
    Long testId,
    String candidateName,
    Integer score,
    Integer totalQuestions,
    Map<Long, Boolean> results,       // Maps questionId -> true (correct) / false (incorrect)
    Map<Long, String> correctAnswers, // Maps questionId -> "A"/"B"/"C"/"D"
    LocalDateTime submittedAt
) {}
