package com.aptis.listening.dto;

import com.aptis.listening.model.AudioSection;
import java.util.List;
import java.util.stream.Collectors;

public record SectionDto(
    Long id,
    Integer partNumber,
    String instruction,
    String audioUrl,
    List<QuestionDto> questions
) {
    public static SectionDto fromEntity(AudioSection entity) {
        return new SectionDto(
            entity.getId(),
            entity.getPartNumber(),
            entity.getInstruction(),
            entity.getAudioUrl(),
            entity.getQuestions().stream()
                .map(QuestionDto::fromEntity)
                .collect(Collectors.toList())
        );
    }
}
