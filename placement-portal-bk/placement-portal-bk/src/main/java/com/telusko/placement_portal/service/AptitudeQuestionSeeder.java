package com.telusko.placement_portal.service;

import com.telusko.placement_portal.entity.AptitudeQuestion;
import com.telusko.placement_portal.entity.AptitudeQuestion.Category;
import com.telusko.placement_portal.entity.AptitudeQuestion.Difficulty;
import com.telusko.placement_portal.entity.AptitudeQuestion.Topic;
import com.telusko.placement_portal.repository.AptitudeQuestionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/** Seeds an initial question bank into MySQL once; student APIs read only persisted rows. */
@Component
public class AptitudeQuestionSeeder implements CommandLineRunner {
    private final AptitudeQuestionRepository questions;

    public AptitudeQuestionSeeder(AptitudeQuestionRepository questions) { this.questions = questions; }

    @Override
    public void run(String... args) {
        if (questions.count() > 0) return;
        questions.saveAll(seedQuestions());
    }

    private List<AptitudeQuestion> seedQuestions() {
        return List.of(
            q(Category.QUANTITATIVE_APTITUDE, Topic.PERCENTAGES, Difficulty.EASY,
                    "A number is increased by 25% and becomes 250. What was the original number?",
                    "200", "187.5", "225", "312.5", 0,
                    "If the original is x, then 1.25x = 250, so x = 200."),
            q(Category.QUANTITATIVE_APTITUDE, Topic.PROFIT_AND_LOSS, Difficulty.EASY,
                    "An item costs ₹800 and is sold for ₹920. What is the profit percentage on cost price?",
                    "12%", "15%", "18%", "20%", 1,
                    "Profit = 920 − 800 = ₹120. Profit percentage = 120/800 × 100 = 15%."),
            q(Category.QUANTITATIVE_APTITUDE, Topic.RATIO_AND_PROPORTION, Difficulty.EASY,
                    "Two amounts are in the ratio 3:5 and total ₹64. What is the smaller amount?",
                    "₹18", "₹21", "₹24", "₹40", 2,
                    "There are 8 total parts, so one part is 64/8 = 8. The smaller amount is 3 × 8 = ₹24."),
            q(Category.QUANTITATIVE_APTITUDE, Topic.AVERAGE, Difficulty.EASY,
                    "The average of five numbers is 18. When a sixth number is added, the average becomes 20. What is the sixth number?",
                    "20", "25", "28", "30", 3,
                    "The first five sum to 5 × 18 = 90. The six sum to 6 × 20 = 120, so the added number is 30."),
            q(Category.QUANTITATIVE_APTITUDE, Topic.TIME_AND_WORK, Difficulty.MEDIUM,
                    "A can complete a task in 12 days and B in 18 days. Working together at constant rates, how long will they take?",
                    "6 days", "7.2 days", "8 days", "15 days", 1,
                    "Their combined daily rate is 1/12 + 1/18 = 5/36 of the task. Time = 36/5 = 7.2 days."),
            q(Category.QUANTITATIVE_APTITUDE, Topic.TIME_SPEED_AND_DISTANCE, Difficulty.MEDIUM,
                    "A car covers 150 km in 2 hours 30 minutes at a constant speed. What is its speed?",
                    "50 km/h", "55 km/h", "60 km/h", "75 km/h", 2,
                    "2 hours 30 minutes is 2.5 hours. Speed = distance/time = 150/2.5 = 60 km/h."),
            q(Category.QUANTITATIVE_APTITUDE, Topic.SIMPLE_AND_COMPOUND_INTEREST, Difficulty.MEDIUM,
                    "What is the compound amount on ₹1,000 at 10% per year for 2 years, compounded annually?",
                    "₹1,200", "₹1,210", "₹1,220", "₹1,250", 1,
                    "Amount = 1000 × (1 + 0.10)² = ₹1,210."),
            q(Category.QUANTITATIVE_APTITUDE, Topic.PROBABILITY, Difficulty.MEDIUM,
                    "Two fair six-sided dice are rolled. What is the probability that their sum is 7?",
                    "1/12", "1/9", "1/6", "1/4", 2,
                    "There are 6 outcomes summing to 7 among 36 equally likely ordered outcomes, so the probability is 6/36 = 1/6."),
            q(Category.QUANTITATIVE_APTITUDE, Topic.PERMUTATIONS_AND_COMBINATIONS, Difficulty.EASY,
                    "In how many different orders can 5 distinct people stand in a line?",
                    "25", "60", "100", "120", 3,
                    "The number of orders is 5! = 5 × 4 × 3 × 2 × 1 = 120."),
            q(Category.QUANTITATIVE_APTITUDE, Topic.NUMBER_SYSTEM, Difficulty.EASY,
                    "Which of these numbers is divisible by 9?",
                    "4,572", "4,571", "4,574", "4,576", 0,
                    "A number is divisible by 9 when its digit sum is divisible by 9. For 4,572 the sum is 18."),
            q(Category.QUANTITATIVE_APTITUDE, Topic.MIXTURES_AND_ALLIGATION, Difficulty.MEDIUM,
                    "A 20-litre solution is 30% acid. How much water must be added to make it 20% acid?",
                    "5 litres", "8 litres", "10 litres", "15 litres", 2,
                    "There are 6 litres of acid. For that to be 20% of the final mixture, total volume must be 30 litres; add 10 litres of water."),
            q(Category.QUANTITATIVE_APTITUDE, Topic.DATA_INTERPRETATION, Difficulty.EASY,
                    "A shop sold 120 notebooks in a day. If 30% were ruled notebooks, how many ruled notebooks were sold?",
                    "30", "36", "40", "42", 1,
                    "30% of 120 = 0.30 × 120 = 36."),

            q(Category.LOGICAL_REASONING, Topic.NUMBER_SERIES, Difficulty.EASY,
                    "What number comes next: 2, 6, 12, 20, 30, ...?",
                    "36", "40", "42", "44", 2,
                    "The differences are 4, 6, 8, and 10. The next difference is 12, giving 42."),
            q(Category.LOGICAL_REASONING, Topic.CODING_AND_DECODING, Difficulty.EASY,
                    "In a code, each letter is replaced by the next letter in the alphabet. How is CAT written?",
                    "DBU", "DBT", "CBU", "EBU", 0,
                    "C becomes D, A becomes B, and T becomes U, so CAT becomes DBU."),
            q(Category.LOGICAL_REASONING, Topic.BLOOD_RELATIONS, Difficulty.MEDIUM,
                    "Maya is the sister of Ravi. Ravi is the father of Nila. How is Maya related to Nila?",
                    "Mother", "Sister", "Aunt", "Cousin", 2,
                    "Maya is Ravi’s sister, and Ravi is Nila’s father. Maya is Nila’s paternal aunt."),
            q(Category.LOGICAL_REASONING, Topic.DIRECTION_SENSE, Difficulty.EASY,
                    "A person faces north, turns right, turns right again, then turns left. Which direction are they facing?",
                    "North", "South", "West", "East", 3,
                    "North → right is east → right is south → left is east."),
            q(Category.LOGICAL_REASONING, Topic.SEATING_ARRANGEMENT, Difficulty.MEDIUM,
                    "Four people A, B, C, and D sit in a row facing forward. A is immediately left of B, B is immediately left of C, and D is immediately right of C. What is the order from left to right?",
                    "A, B, C, D", "D, C, B, A", "B, A, D, C", "A, C, B, D", 0,
                    "The three consecutive constraints fix the complete order as A, B, C, D."),
            q(Category.LOGICAL_REASONING, Topic.PUZZLES, Difficulty.MEDIUM,
                    "Three boxes are labelled APPLES, ORANGES, and MIXED. Every label is wrong. You may take one fruit from one box. Which box should you sample to identify all boxes?",
                    "The box labelled APPLES", "The box labelled MIXED", "The box labelled ORANGES", "Any box", 1,
                    "The box labelled MIXED cannot be mixed because its label is wrong. One fruit reveals its true single-fruit contents; the other two wrong labels then determine the remaining boxes."),
            q(Category.LOGICAL_REASONING, Topic.SYLLOGISMS, Difficulty.EASY,
                    "Premises: All pens are tools. Some tools are metal. Which conclusion must be true?",
                    "Some pens are metal", "All tools are pens", "No pens are metal", "No conclusion about pens being metal follows", 3,
                    "The metal tools may or may not be pens. The premises do not establish an overlap between pens and metal tools."),
            q(Category.LOGICAL_REASONING, Topic.ANALOGIES, Difficulty.EASY,
                    "Complete the analogy: Book is to reading as fork is to ___.",
                    "Writing", "Eating", "Cooking", "Serving", 1,
                    "A book is an instrument used for reading; a fork is an instrument used for eating."),
            q(Category.LOGICAL_REASONING, Topic.STATEMENT_AND_CONCLUSION, Difficulty.MEDIUM,
                    "Statements: All interns are graduates. No graduate is a minor. Which conclusion follows?",
                    "Some interns are minors", "No intern is a minor", "All graduates are interns", "No conclusion follows", 1,
                    "Every intern is a graduate, and no graduate is a minor. Therefore, no intern is a minor."),
            q(Category.LOGICAL_REASONING, Topic.RANKING_AND_ORDERING, Difficulty.EASY,
                    "There are 23 students in a row. If one student is 7th from the left, what is that student’s position from the right?",
                    "15th", "16th", "17th", "18th", 2,
                    "Position from right = 23 − 7 + 1 = 17."),

            q(Category.VERBAL_ABILITY, Topic.GRAMMAR, Difficulty.EASY,
                    "Choose the grammatically correct sentence.",
                    "Each of the applicants have submitted a form.", "Each of the applicants has submitted a form.", "Each applicants has submitted a form.", "Each of applicants have submitted the form.", 1,
                    "Each is singular, so it takes the singular verb has."),
            q(Category.VERBAL_ABILITY, Topic.VOCABULARY, Difficulty.MEDIUM,
                    "What does the word ‘mitigate’ most nearly mean?",
                    "Make less severe", "Make permanent", "Measure precisely", "Cause suddenly", 0,
                    "To mitigate a problem is to reduce its severity or harmful effect."),
            q(Category.VERBAL_ABILITY, Topic.SYNONYMS_AND_ANTONYMS, Difficulty.EASY,
                    "Choose the antonym of ‘abundant’. ",
                    "Plentiful", "Ample", "Scarce", "Sufficient", 2,
                    "Abundant means plentiful; scarce means limited or in short supply."),
            q(Category.VERBAL_ABILITY, Topic.SENTENCE_CORRECTION, Difficulty.MEDIUM,
                    "Choose the sentence with correct subject–verb agreement.",
                    "Neither the manager nor the employees was present.", "Neither the manager nor the employees is present yesterday.", "Neither the employees nor the manager were present.", "Neither the employees nor the manager was present.", 3,
                    "With neither…nor, the verb agrees with the nearer subject. Manager is singular, so was is correct."),
            q(Category.VERBAL_ABILITY, Topic.READING_COMPREHENSION, Difficulty.MEDIUM,
                    "Passage: A team replaced a long weekly meeting with a short written update. Decisions were recorded asynchronously, while urgent issues still received live discussion. After a month, the team reported fewer interruptions. What change reduced routine meeting time?",
                    "Removing all live discussion", "Using written updates for routine decisions", "Adding another weekly meeting", "Moving every decision to a manager", 1,
                    "The passage says routine decisions moved to short written updates, while urgent matters remained live."),
            q(Category.VERBAL_ABILITY, Topic.FILL_IN_THE_BLANKS, Difficulty.EASY,
                    "Complete the sentence: ‘Despite the ___ rain, the match continued.’",
                    "heavily", "heavier", "heaviness", "heavy", 3,
                    "Rain is a noun here, so the adjective heavy correctly describes it."),
            q(Category.VERBAL_ABILITY, Topic.PARA_JUMBLES, Difficulty.MEDIUM,
                    "Arrange the sentences into a logical paragraph. A: The water is then filtered. B: Finally, it is stored in a clean tank. C: First, raw water enters the treatment plant. D: After filtering, it is disinfected.",
                    "C, A, D, B", "A, C, B, D", "C, D, A, B", "B, C, A, D", 0,
                    "The process begins with raw water entering (C), then filtering (A), disinfection (D), and final storage (B)."),

            q(Category.COMPUTER_APTITUDE, Topic.BINARY_NUMBERS, Difficulty.EASY,
                    "What is the decimal value of the binary number 11010₂?",
                    "24", "25", "26", "28", 2,
                    "11010₂ = 1×16 + 1×8 + 0×4 + 1×2 + 0×1 = 26."),
            q(Category.COMPUTER_APTITUDE, Topic.NUMBER_CONVERSIONS, Difficulty.MEDIUM,
                    "Which binary number represents decimal 45?",
                    "101011", "101101", "110101", "111001", 1,
                    "45 = 32 + 8 + 4 + 1, which sets the 32, 8, 4, and 1 places: 101101₂."),
            q(Category.COMPUTER_APTITUDE, Topic.BASIC_COMPUTER_FUNDAMENTALS, Difficulty.EASY,
                    "Which statement about RAM is correct?",
                    "It is volatile memory and normally loses its contents when power is removed.", "It is permanent storage for archived files.", "It is an output device.", "It stores data only on optical discs.", 0,
                    "Main memory RAM is volatile: its working contents are not retained after power is removed."),
            q(Category.COMPUTER_APTITUDE, Topic.BOOLEAN_LOGIC, Difficulty.EASY,
                    "What is the output of an XOR gate when its two inputs are 1 and 0?",
                    "0", "1", "Undefined", "Depends on clock speed", 1,
                    "XOR outputs 1 when its inputs differ. Since 1 and 0 differ, the output is 1."),
            q(Category.COMPUTER_APTITUDE, Topic.ANALYTICAL_COMPUTER_QUESTIONS, Difficulty.MEDIUM,
                    "For an 8-bit unsigned value, what decimal result does the bitwise operation 00000101₂ << 1 produce?",
                    "5", "8", "10", "12", 2,
                    "A left shift by one place doubles 5 in this case: 00001010₂ = 10." )
        );
    }

    private AptitudeQuestion q(Category category, Topic topic, Difficulty difficulty, String text,
                               String a, String b, String c, String d, int correct, String explanation) {
        AptitudeQuestion question = new AptitudeQuestion();
        question.setCategory(category); question.setTopic(topic); question.setDifficulty(difficulty);
        question.setQuestionText(text); question.setOptionA(a); question.setOptionB(b);
        question.setOptionC(c); question.setOptionD(d); question.setCorrectOptionIndex(correct);
        question.setExplanation(explanation); question.setActive(true);
        return question;
    }
}
