package com.telusko.placement_portal.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "aptitude_questions", indexes = {
        @Index(name = "idx_aptitude_question_category_topic", columnList = "category,topic,active"),
        @Index(name = "idx_aptitude_question_difficulty", columnList = "difficulty,active")
})
public class AptitudeQuestion {
    public enum Category { QUANTITATIVE_APTITUDE, LOGICAL_REASONING, VERBAL_ABILITY, COMPUTER_APTITUDE }
    public enum Topic {
        PERCENTAGES, PROFIT_AND_LOSS, RATIO_AND_PROPORTION, AVERAGE, TIME_AND_WORK,
        TIME_SPEED_AND_DISTANCE, SIMPLE_AND_COMPOUND_INTEREST, PROBABILITY,
        PERMUTATIONS_AND_COMBINATIONS, NUMBER_SYSTEM, MIXTURES_AND_ALLIGATION, DATA_INTERPRETATION,
        NUMBER_SERIES, CODING_AND_DECODING, BLOOD_RELATIONS, DIRECTION_SENSE, SEATING_ARRANGEMENT,
        PUZZLES, SYLLOGISMS, ANALOGIES, STATEMENT_AND_CONCLUSION, RANKING_AND_ORDERING,
        GRAMMAR, VOCABULARY, SYNONYMS_AND_ANTONYMS, SENTENCE_CORRECTION,
        READING_COMPREHENSION, FILL_IN_THE_BLANKS, PARA_JUMBLES,
        BINARY_NUMBERS, NUMBER_CONVERSIONS, BASIC_COMPUTER_FUNDAMENTALS,
        BOOLEAN_LOGIC, ANALYTICAL_COMPUTER_QUESTIONS
    }
    public enum Difficulty { EASY, MEDIUM, HARD }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private Topic topic;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 12)
    private Difficulty difficulty;

    @Column(nullable = false, length = 2500)
    private String questionText;

    @Column(nullable = false, length = 1000)
    private String optionA;
    @Column(nullable = false, length = 1000)
    private String optionB;
    @Column(nullable = false, length = 1000)
    private String optionC;
    @Column(nullable = false, length = 1000)
    private String optionD;

    @Column(nullable = false)
    private int correctOptionIndex;

    @Column(nullable = false, length = 2500)
    private String explanation;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public Topic getTopic() { return topic; }
    public void setTopic(Topic topic) { this.topic = topic; }
    public Difficulty getDifficulty() { return difficulty; }
    public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }
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
    public String optionAt(int index) {
        return switch (index) { case 0 -> optionA; case 1 -> optionB; case 2 -> optionC; case 3 -> optionD; default -> throw new IllegalArgumentException("Option index must be 0–3"); };
    }
    public int getCorrectOptionIndex() { return correctOptionIndex; }
    public void setCorrectOptionIndex(int correctOptionIndex) { this.correctOptionIndex = correctOptionIndex; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
