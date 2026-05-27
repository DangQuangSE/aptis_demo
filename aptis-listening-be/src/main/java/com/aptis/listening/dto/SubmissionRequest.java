package com.aptis.listening.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.Map;

public record SubmissionRequest(
    @NotBlank(message = "Candidate name cannot be blank")
    String candidateName,

    @NotEmpty(message = "Answers map cannot be empty")
    Map<Long, String> answers // maps questionId -> chosenOption ("A", "B", "C", "D")
) {}
