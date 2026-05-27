package com.aptis.listening.service;

import com.aptis.listening.dto.SubmissionRequest;
import com.aptis.listening.dto.SubmissionResponse;
import com.aptis.listening.model.AudioSection;
import com.aptis.listening.model.Question;
import com.aptis.listening.model.Submission;
import com.aptis.listening.model.TestEntity;
import com.aptis.listening.repository.SubmissionRepository;
import com.aptis.listening.repository.TestRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class TestService {

    private final TestRepository testRepository;
    private final SubmissionRepository submissionRepository;
    private final ObjectMapper objectMapper;

    public TestService(TestRepository testRepository, SubmissionRepository submissionRepository, ObjectMapper objectMapper) {
        this.testRepository = testRepository;
        this.submissionRepository = submissionRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<TestEntity> getAllTests() {
        return testRepository.findAll();
    }

    @Transactional(readOnly = true)
    public TestEntity getTestById(Long id) {
        return testRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test not found with ID: " + id));
    }

    public TestEntity createTest(TestEntity test) {
        linkRelations(test);
        return testRepository.save(test);
    }

    public TestEntity updateTest(Long id, TestEntity updatedTest) {
        TestEntity existing = getTestById(id);
        
        existing.setTitle(updatedTest.getTitle());
        existing.setDescription(updatedTest.getDescription());
        existing.setDurationMinutes(updatedTest.getDurationMinutes());
        
        // Fully replace sections/questions to support orphan removal properly in JPA
        existing.getSections().clear();
        if (updatedTest.getSections() != null) {
            for (AudioSection updatedSection : updatedTest.getSections()) {
                AudioSection newSection = new AudioSection(
                    updatedSection.getPartNumber(),
                    updatedSection.getInstruction(),
                    updatedSection.getAudioUrl(),
                    updatedSection.getTranscript()
                );
                if (updatedSection.getQuestions() != null) {
                    for (Question updatedQuestion : updatedSection.getQuestions()) {
                        newSection.addQuestion(new Question(
                            updatedQuestion.getQuestionText(),
                            updatedQuestion.getOptionA(),
                            updatedQuestion.getOptionB(),
                            updatedQuestion.getOptionC(),
                            updatedQuestion.getOptionD(),
                            updatedQuestion.getCorrectOption(),
                            updatedQuestion.getExplanation()
                        ));
                    }
                }
                existing.addSection(newSection);
            }
        }
        
        linkRelations(existing);
        return testRepository.save(existing);
    }

    public void deleteTest(Long id) {
        TestEntity test = getTestById(id);
        testRepository.delete(test);
    }

    private void linkRelations(TestEntity test) {
        if (test.getSections() != null) {
            for (AudioSection section : test.getSections()) {
                section.setTest(test);
                if (section.getQuestions() != null) {
                    for (Question question : section.getQuestions()) {
                        question.setSection(section);
                    }
                }
            }
        }
    }

    public SubmissionResponse submitTest(Long testId, SubmissionRequest request) {
        TestEntity test = getTestById(testId);
        
        Map<Long, String> userAnswers = request.answers();
        Map<Long, Boolean> results = new HashMap<>();
        Map<Long, String> correctAnswers = new HashMap<>();
        
        int score = 0;
        int totalQuestions = 0;

        // Iterate through all sections and questions to grade them
        for (AudioSection section : test.getSections()) {
            for (Question question : section.getQuestions()) {
                totalQuestions++;
                Long qId = question.getId();
                String correctAns = question.getCorrectOption();
                correctAnswers.put(qId, correctAns);

                String userAns = userAnswers.get(qId);
                if (userAns != null && userAns.trim().equalsIgnoreCase(correctAns.trim())) {
                    score++;
                    results.put(qId, true);
                } else {
                    results.put(qId, false);
                }
            }
        }

        // Convert user answers to JSON String for storage
        String answersJson;
        try {
            answersJson = objectMapper.writeValueAsString(userAnswers);
        } catch (JsonProcessingException e) {
            answersJson = "{}";
        }

        // Save submission
        Submission submission = new Submission(testId, request.candidateName(), score, totalQuestions, answersJson);
        submission = submissionRepository.save(submission);

        return new SubmissionResponse(
                submission.getId(),
                testId,
                submission.getCandidateName(),
                submission.getScore(),
                submission.getTotalQuestions(),
                results,
                correctAnswers,
                submission.getSubmittedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<Submission> getSubmissionsByTestId(Long testId) {
        return submissionRepository.findByTestIdOrderBySubmittedAtDesc(testId);
    }
}
