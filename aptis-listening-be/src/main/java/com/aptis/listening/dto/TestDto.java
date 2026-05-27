package com.aptis.listening.dto;

import com.aptis.listening.model.TestEntity;
import java.util.List;
import java.util.stream.Collectors;

public record TestDto(
    Long id,
    String title,
    String description,
    Integer durationMinutes,
    List<SectionDto> sections
) {
    public static TestDto fromEntity(TestEntity entity) {
        return new TestDto(
            entity.getId(),
            entity.getTitle(),
            entity.getDescription(),
            entity.getDurationMinutes(),
            entity.getSections().stream()
                .map(SectionDto::fromEntity)
                .collect(Collectors.toList())
        );
    }
}
