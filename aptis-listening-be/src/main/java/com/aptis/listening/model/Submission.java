package com.aptis.listening.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "test_id", nullable = false)
    private Long testId;

    @NotBlank(message = "Candidate name is required")
    @Column(name = "candidate_name", nullable = false)
    private String candidateName;

    @NotNull
    @Column(nullable = false)
    private Integer score;

    @NotNull
    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;

    @Column(name = "answers_json", columnDefinition = "TEXT")
    private String answersJson; // Maps question ID to user answer, e.g. {"1":"A","2":"B"}

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;

    // Constructors
    public Submission() {}

    public Submission(Long testId, String candidateName, Integer score, Integer totalQuestions, String answersJson) {
        this.testId = testId;
        this.candidateName = candidateName;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.answersJson = answersJson;
        this.submittedAt = LocalDateTime.now();
    }

    // Lifecycle hook to set current time if null
    @PrePersist
    protected void onCreate() {
        if (submittedAt == null) {
            submittedAt = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTestId() { return testId; }
    public void setTestId(Long testId) { this.testId = testId; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public Integer getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(Integer totalQuestions) { this.totalQuestions = totalQuestions; }

    public String getAnswersJson() { return answersJson; }
    public void setAnswersJson(String answersJson) { this.answersJson = answersJson; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}
