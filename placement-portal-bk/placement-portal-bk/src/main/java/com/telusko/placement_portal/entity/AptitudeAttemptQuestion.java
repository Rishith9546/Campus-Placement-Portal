package com.telusko.placement_portal.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "aptitude_attempt_questions",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_aptitude_attempt_position", columnNames = {"attempt_id", "position_index"}),
                @UniqueConstraint(name = "uk_aptitude_attempt_question", columnNames = {"attempt_id", "question_id"})
        },
        indexes = @Index(name = "idx_aptitude_attempt_question_attempt", columnList = "attempt_id"))
public class AptitudeAttemptQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attempt_id", nullable = false)
    private AptitudeAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private AptitudeQuestion question;

    @Column(name = "position_index", nullable = false)
    private int position;

    // Comma-separated original option indexes, shuffled once per attempt.
    @Column(name = "option_order", nullable = false, length = 16)
    private String optionOrder;

    private Integer selectedOptionIndex;

    @Column(nullable = false)
    private boolean markedForReview;

    public Long getId() { return id; }
    public AptitudeAttempt getAttempt() { return attempt; }
    public void setAttempt(AptitudeAttempt attempt) { this.attempt = attempt; }
    public AptitudeQuestion getQuestion() { return question; }
    public void setQuestion(AptitudeQuestion question) { this.question = question; }
    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }
    public String getOptionOrder() { return optionOrder; }
    public void setOptionOrder(String optionOrder) { this.optionOrder = optionOrder; }
    public Integer getSelectedOptionIndex() { return selectedOptionIndex; }
    public void setSelectedOptionIndex(Integer selectedOptionIndex) { this.selectedOptionIndex = selectedOptionIndex; }
    public boolean isMarkedForReview() { return markedForReview; }
    public void setMarkedForReview(boolean markedForReview) { this.markedForReview = markedForReview; }
}
