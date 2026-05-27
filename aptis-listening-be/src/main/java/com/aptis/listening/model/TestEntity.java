package com.aptis.listening.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tests")
public class TestEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Duration is required")
    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @OneToMany(mappedBy = "test", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("partNumber ASC")
    private List<AudioSection> sections = new ArrayList<>();

    // Constructors
    public TestEntity() {}

    public TestEntity(String title, String description, Integer durationMinutes) {
        this.title = title;
        this.description = description;
        this.durationMinutes = durationMinutes;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public List<AudioSection> getSections() { return sections; }
    public void setSections(List<AudioSection> sections) { this.sections = sections; }

    public void addSection(AudioSection section) {
        sections.add(section);
        section.setTest(this);
    }
}
