package com.aptis.listening.dto;

import com.aptis.listening.model.Question;

public record QuestionDto(
    Long id,
    String questionText,
    String optionA,
    String optionB,
    String optionC,
    String optionD
) {
    public static QuestionDto fromEntity(Question entity) {
        return new QuestionDto(
            entity.getId(),
            entity.getQuestionText(),
            entity.getOptionA(),
            entity.getOptionB(),
            entity.getOptionC(),
            entity.getOptionD()
        );
    }
}
