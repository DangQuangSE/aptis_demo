package com.aptis.listening.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "audio_sections")
public class AudioSection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "part_number", nullable = false)
    private Integer partNumber; // 1, 2, 3, or 4

    @Column(columnDefinition = "TEXT")
    private String instruction;

    @Column(name = "audio_url", nullable = false)
    private String audioUrl;

    @Column(columnDefinition = "TEXT")
    private String transcript;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id", nullable = false)
    @JsonIgnore
    private TestEntity test;

    @OneToMany(mappedBy = "section", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Question> questions = new ArrayList<>();

    // Constructors
    public AudioSection() {}

    public AudioSection(Integer partNumber, String instruction, String audioUrl, String transcript) {
        this.partNumber = partNumber;
        this.instruction = instruction;
        this.audioUrl = audioUrl;
        this.transcript = transcript;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getPartNumber() { return partNumber; }
    public void setPartNumber(Integer partNumber) { this.partNumber = partNumber; }

    public String getInstruction() { return instruction; }
    public void setInstruction(String instruction) { this.instruction = instruction; }

    public String getAudioUrl() { return audioUrl; }
    public void setAudioUrl(String audioUrl) { this.audioUrl = audioUrl; }

    public String getTranscript() { return transcript; }
    public void setTranscript(String transcript) { this.transcript = transcript; }

    public TestEntity getTest() { return test; }
    public void setTest(TestEntity test) { this.test = test; }

    public List<Question> getQuestions() { return questions; }
    public void setQuestions(List<Question> questions) { this.questions = questions; }

    public void addQuestion(Question question) {
        questions.add(question);
        question.setSection(this);
    }
}
