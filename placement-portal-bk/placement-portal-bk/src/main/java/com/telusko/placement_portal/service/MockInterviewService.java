
package com.telusko.placement_portal.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class MockInterviewService {

    private static final String OLLAMA_URL =
            "http://localhost:11434/api/generate";

    private static final String MODEL = "llama3.2:3b";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public MockInterviewService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    // Supports controllers that pass three separate arguments.
    public Map<String, Object> generateQuestions(
            String topic,
            String difficulty,
            int questionCount) {

        Map<String, Object> request = new HashMap<>();
        request.put("topic", topic);
        request.put("difficulty", difficulty);
        request.put("questionCount", questionCount);

        return generateQuestions(request);
    }

    // Supports controllers that pass a request map.
    public Map<String, Object> generateQuestions(
            Map<String, Object> request) {

        try {
            String topic = getRequiredString(request, "topic");
            String difficulty =
                    getRequiredString(request, "difficulty");
            int questionCount = getQuestionCount(request);

            String prompt = """
                    You are an experienced technical interviewer.

                    Generate technical interview questions.

                    Topic: %s
                    Difficulty: %s
                    Number of questions: %d

                    Requirements:
                    1. Generate exactly %d questions.
                    2. Match the requested topic and difficulty.
                    3. Avoid duplicate questions.
                    4. Return JSON only, without Markdown.
                    5. Do not include answers.

                    Return this JSON structure:
                    {
                      "questions": [
                        {
                          "id": 1,
                          "question": "Question text"
                        }
                      ]
                    }
                    """.formatted(
                    topic,
                    difficulty,
                    questionCount,
                    questionCount
            );

            Map<String, Object> result = callOllama(prompt);

            Object questionsObject = result.get("questions");

            if (!(questionsObject instanceof List<?> questions)) {
                throw new RuntimeException(
                        "AI did not return a valid questions list."
                );
            }

            List<Map<String, Object>> normalizedQuestions =
                    new ArrayList<>();

            for (Object item : questions) {
                if (!(item instanceof Map<?, ?> rawQuestion)) {
                    continue;
                }

                Object textObject = rawQuestion.get("question");

                if (!(textObject instanceof String questionText)
                        || questionText.isBlank()) {
                    continue;
                }

                Map<String, Object> question = new LinkedHashMap<>();
                question.put("id", normalizedQuestions.size() + 1);
                question.put("question", questionText.trim());

                normalizedQuestions.add(question);

                if (normalizedQuestions.size() == questionCount) {
                    break;
                }
            }

            if (normalizedQuestions.size() != questionCount) {
                throw new RuntimeException(
                        "AI generated "
                                + normalizedQuestions.size()
                                + " valid questions instead of "
                                + questionCount
                                + ". Please try again."
                );
            }

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("topic", topic);
            response.put("difficulty", difficulty);
            response.put("totalQuestions", questionCount);
            response.put("questions", normalizedQuestions);

            return response;

        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to generate interview questions: "
                            + e.getMessage(),
                    e
            );
        }
    }

    // Evaluate submitted answers.
    public Map<String, Object> evaluateAnswers(
            Map<String, Object> request) {

        try {
            String topic = getRequiredString(request, "topic");
            String difficulty =
                    getRequiredString(request, "difficulty");

            Object answersObject = request.get("answers");

            if (!(answersObject instanceof List<?> answerList)
                    || answerList.isEmpty()) {
                throw new RuntimeException(
                        "Please submit at least one interview answer."
                );
            }

            List<Map<String, Object>> validatedAnswers =
                    new ArrayList<>();

            for (int i = 0; i < answerList.size(); i++) {
                Object item = answerList.get(i);

                if (!(item instanceof Map<?, ?> rawAnswer)) {
                    throw new RuntimeException(
                            "Invalid answer format at question "
                                    + (i + 1) + "."
                    );
                }

                Object questionObject = rawAnswer.get("question");
                Object answerObject = rawAnswer.get("answer");

                if (!(questionObject instanceof String question)
                        || question.isBlank()) {
                    throw new RuntimeException(
                            "Question " + (i + 1) + " is missing."
                    );
                }

                String answer = answerObject instanceof String text
                        ? text.trim()
                        : "";

                Map<String, Object> submittedAnswer =
                        new LinkedHashMap<>();

                submittedAnswer.put("question", question.trim());
                submittedAnswer.put("answer", answer);

                validatedAnswers.add(submittedAnswer);
            }

            int answerCount = validatedAnswers.size();

            String prompt = """
                    You are an experienced technical interviewer.

                    Evaluate the candidate's answers.

                    Topic: %s
                    Difficulty: %s

                    Submitted answers:
                    %s

                    Return ONLY valid JSON:
                    {
                      "strengths": ["Specific strength"],
                      "weaknesses": ["Area to improve"],
                      "suggestions": ["Practical suggestion"],
                      "answerFeedback": [
                        {
                          "score": 7,
                          "feedback": "Explain correctness and how to improve."
                        }
                      ]
                    }

                    Rules:
                    1. Return exactly %d answerFeedback entries.
                    2. Preserve the submitted answer order.
                    3. Give each answer a numeric score from 0 to 10.
                    4. An empty answer must receive a score of 0.
                    5. Evaluate correctness, clarity and completeness.
                    6. Give constructive feedback.
                    7. Return JSON only, without Markdown.
                    """.formatted(
                    topic,
                    difficulty,
                    objectMapper.writeValueAsString(validatedAnswers),
                    answerCount
            );

            Map<String, Object> result = callOllama(prompt);

            Object feedbackObject = result.get("answerFeedback");

            List<?> feedbackList =
                    feedbackObject instanceof List<?> list
                            ? list
                            : Collections.emptyList();

            List<Map<String, Object>> normalizedFeedback =
                    new ArrayList<>();

            double totalScore = 0;

            for (int i = 0; i < answerCount; i++) {
                Map<String, Object> submittedAnswer =
                        validatedAnswers.get(i);

                Map<String, Object> feedback =
                        new LinkedHashMap<>();

                if (i < feedbackList.size()
                        && feedbackList.get(i)
                        instanceof Map<?, ?> rawFeedback) {

                    rawFeedback.forEach((key, value) ->
                            feedback.put(
                                    String.valueOf(key),
                                    value
                            )
                    );
                } else {
                    feedback.put(
                            "feedback",
                            "The AI did not provide feedback for this "
                                    + "answer. Please try again for a "
                                    + "complete evaluation."
                    );
                }

                double score = 0;
                Object scoreObject = feedback.get("score");

                if (scoreObject instanceof Number number) {
                    double value = number.doubleValue();

                    if (Double.isFinite(value)
                            && value >= 0
                            && value <= 10) {
                        score = value;
                    }
                }

                // Empty answers must score zero.
                if (String.valueOf(submittedAnswer.get("answer"))
                        .isBlank()) {
                    score = 0;
                    feedback.put(
                            "feedback",
                            "No answer was provided for this question."
                    );
                }

                feedback.put(
                        "question",
                        submittedAnswer.get("question")
                );
                feedback.put("score", score);
                feedback.put("maxScore", 10);

                if (!(feedback.get("feedback") instanceof String)) {
                    feedback.put(
                            "feedback",
                            "Review your answer for correctness, "
                                    + "clarity and completeness."
                    );
                }

                normalizedFeedback.add(feedback);
                totalScore += score;
            }

            double averageScore = Math.round(
                    (totalScore / answerCount) * 10.0
            ) / 10.0;

            if (!(result.get("strengths") instanceof List<?>)) {
                result.put("strengths", new ArrayList<>());
            }

            if (!(result.get("weaknesses") instanceof List<?>)) {
                result.put("weaknesses", new ArrayList<>());
            }

            if (!(result.get("suggestions") instanceof List<?>)) {
                result.put("suggestions", new ArrayList<>());
            }

            result.put("topic", topic);
            result.put("difficulty", difficulty);
            result.put("totalQuestions", answerCount);
            result.put("score", averageScore);
            result.put("maxScore", 10);
            result.put("answerFeedback", normalizedFeedback);

            return result;

        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to evaluate interview answers: "
                            + e.getMessage(),
                    e
            );
        }
    }

    // Communicate with the local Ollama server.
    private Map<String, Object> callOllama(String prompt)
            throws Exception {

        Map<String, Object> ollamaRequest = new HashMap<>();
        ollamaRequest.put("model", MODEL);
        ollamaRequest.put("prompt", prompt);
        ollamaRequest.put("stream", false);
        ollamaRequest.put("format", "json");

        Map<?, ?> ollamaResponse = restTemplate.postForObject(
                OLLAMA_URL,
                ollamaRequest,
                Map.class
        );

        if (ollamaResponse == null) {
            throw new RuntimeException(
                    "Ollama returned an empty response."
            );
        }

        Object responseObject = ollamaResponse.get("response");

        if (!(responseObject instanceof String aiText)
                || aiText.isBlank()) {
            throw new RuntimeException(
                    "Ollama did not return generated text."
            );
        }

        return objectMapper.readValue(aiText, Map.class);
    }

    private String getRequiredString(
            Map<String, Object> request,
            String fieldName) {

        Object value = request.get(fieldName);

        if (!(value instanceof String text) || text.isBlank()) {
            throw new RuntimeException(
                    "The '" + fieldName + "' field is required."
            );
        }

        return text.trim();
    }

    private int getQuestionCount(Map<String, Object> request) {
        Object countObject = request.get("questionCount");

        if (!(countObject instanceof Number number)) {
            throw new RuntimeException(
                    "A valid questionCount is required."
            );
        }

        int count = number.intValue();

        if (count < 1 || count > 20
                || number.doubleValue() != count) {
            throw new RuntimeException(
                    "Question count must be a whole number between 1 and 20."
            );
        }

        return count;
    }
}
