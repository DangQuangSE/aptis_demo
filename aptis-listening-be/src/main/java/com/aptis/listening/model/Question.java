package com.aptis.listening.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Question text is required")
    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @NotBlank(message = "Option A is required")
    @Column(name = "option_a", nullable = false)
    private String optionA;

    @NotBlank(message = "Option B is required")
    @Column(name = "option_b", nullable = false)
    private String optionB;

    @NotBlank(message = "Option C is required")
    @Column(name = "option_c", nullable = false)
    private String optionC;

    @Column(name = "option_d")
    private String optionD; // Can be null (some questions have 3 options, standard Aptis is mostly 3 or 4 choices)

    @NotBlank(message = "Correct option is required")
    @Column(name = "correct_option", nullable = false)
    private String correctOption; // "A", "B", "C", "D"

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    @JsonIgnore
    private AudioSection section;

    // Constructors
    public Question() {}

    public Question(String questionText, String optionA, String optionB, String optionC, String optionD, String correctOption, String explanation) {
        this.questionText = questionText;
        this.optionA = optionA;
        this.optionB = optionB;
        this.optionC = optionC;
        this.optionD = optionD;
        this.correctOption = correctOption;
        this.explanation = explanation;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }

    public String getOptionA() { return optionA; }
    public void setOptionA(String optionA) { this.optionA = optionA; }

    public String getOptionB() { return optionB; }
    public void setOptionB(String optionB) { this.optionB = optionB; }

    public String getOptionC() { return optionC; }
    public void setOptionC(String optionC) { this.optionC = optionC; }

    public String getOptionD() { return optionD; }
    public void setOptionD(String optionD) { this.optionD = optionD; }

    public String getCorrectOption() { return correctOption; }
    public void setCorrectOption(String correctOption) { this.correctOption = correctOption; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public AudioSection getSection() { return section; }
    public void setSection(AudioSection section) { this.section = section; }
}
