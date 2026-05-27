package com.aptis.listening.service;

import com.aptis.listening.model.AudioSection;
import com.aptis.listening.model.Question;
import com.aptis.listening.model.TestEntity;
import com.aptis.listening.repository.TestRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final TestRepository testRepository;
    private final ObjectMapper objectMapper;
    private static final String BASE_URL = "https://aptiskey.com/";

    public DatabaseSeeder(TestRepository testRepository, ObjectMapper objectMapper) {
        this.testRepository = testRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public void run(String... args) throws Exception {
        if (testRepository.count() > 0) {
            System.out.println("Database already seeded with " + testRepository.count() + " tests. Skipping seeding.");
            return;
        }

        System.out.println("Starting database seeding from scraped JSON datasets...");

        // 1. Load Part 1 (Q1-13) - 210 questions
        List<Part1Json> part1List;
        try (InputStream is = getClass().getResourceAsStream("/scraped_data/question_1_13.json")) {
            part1List = objectMapper.readValue(is, new TypeReference<List<Part1Json>>() {});
            System.out.println("Successfully loaded " + part1List.size() + " questions for Part 1.");
        }

        // 2. Load Part 2 (Q14) - 12 topics
        List<Part2Json> part2List;
        try (InputStream is = getClass().getResourceAsStream("/scraped_data/question_14.json")) {
            part2List = objectMapper.readValue(is, new TypeReference<List<Part2Json>>() {});
            System.out.println("Successfully loaded " + part2List.size() + " topics for Part 2.");
        }

        // 3. Load Part 3 (Q15) - 12 topics
        List<Part3Json> part3List;
        try (InputStream is = getClass().getResourceAsStream("/scraped_data/question_15.json")) {
            part3List = objectMapper.readValue(is, new TypeReference<List<Part3Json>>() {});
            System.out.println("Successfully loaded " + part3List.size() + " topics for Part 3.");
        }

        // 4. Load Part 4 (Q16-17) - 54 academic lectures
        List<Part4Json> part4List;
        try (InputStream is = getClass().getResourceAsStream("/scraped_data/question_16_17.json")) {
            part4List = objectMapper.readValue(is, new TypeReference<List<Part4Json>>() {});
            System.out.println("Successfully loaded " + part4List.size() + " lectures for Part 4.");
        }

        // --- DYNAMIC SHUFFLING ---
        // Shuffling the question banks dynamically ensures that every startup generates a completely unique, randomized set of mock tests
        List<Part1Json> part1Shuffled = new ArrayList<>(part1List);
        Collections.shuffle(part1Shuffled);

        List<Part2Json> part2Shuffled = new ArrayList<>(part2List);
        Collections.shuffle(part2Shuffled);

        List<Part3Json> part3Shuffled = new ArrayList<>(part3List);
        Collections.shuffle(part3Shuffled);

        List<Part4Json> part4Shuffled = new ArrayList<>(part4List);
        Collections.shuffle(part4Shuffled);

        // 5. Generate 16 balanced practice tests
        int totalTests = 16;
        for (int i = 1; i <= totalTests; i++) {
            TestEntity test = new TestEntity(
                    "Aptis Listening Mock Test " + i,
                    "Comprehensive simulated mock test " + i + " matching the official Aptis General Listening format. Paced with standard timing and sections.",
                    40
            );

            // Add Part 1: 13 short messages/questions per test.
            // Takes a random 13 questions from the shuffled pool
            if (!part1Shuffled.isEmpty()) {
                for (int k = 0; k < 13; k++) {
                    int idx = ((i - 1) * 13 + k) % part1Shuffled.size();
                    Part1Json p1 = part1Shuffled.get(idx);
                    String audioPath = p1.audioUrl();
                    if (audioPath != null && !audioPath.startsWith("http")) {
                        audioPath = BASE_URL + audioPath;
                    }

                    AudioSection sec = new AudioSection(
                            1,
                            "Part 1: Information Gathering. Listen to the short recording and choose the correct option (A, B, or C).",
                            audioPath,
                            p1.transcript()
                    );

                    // Determine correct letter choice from the options list
                    String correctLetter = "A";
                    int optIdx = p1.options().indexOf(p1.correctAnswer());
                    if (optIdx >= 0 && optIdx < 3) {
                        correctLetter = String.valueOf((char) ('A' + optIdx));
                    }

                    String optA = p1.options().size() > 0 ? p1.options().get(0) : "";
                    String optB = p1.options().size() > 1 ? p1.options().get(1) : "";
                    String optC = p1.options().size() > 2 ? p1.options().get(2) : "";

                    sec.addQuestion(new Question(
                            p1.question(),
                            optA,
                            optB,
                            optC,
                            null,
                            correctLetter,
                            "The correct answer is " + p1.correctAnswer() + "."
                    ));
                    test.addSection(sec);
                }
            }

            // Add Part 2: 1 matching task per test (recycled from 12 topics)
            if (!part2Shuffled.isEmpty()) {
                int p2Idx = (i - 1) % part2Shuffled.size();
                Part2Json p2 = part2Shuffled.get(p2Idx);
                String audioPath = p2.audioUrl();
                if (audioPath != null && !audioPath.startsWith("http")) {
                    audioPath = BASE_URL + audioPath;
                }

                AudioSection sec2 = new AudioSection(
                        2,
                        "Part 2: Information Matching. Listen to four people expressing their opinions on: " + p2.topic().replace("Topic: ", "") + ". Match each person (A-D) to their corresponding opinion.",
                        audioPath,
                        p2.transcript()
                );

                // Options are the 4 correct answers corresponding to Persons A-D
                String p2OptA = p2.options().size() > 0 ? p2.options().get(0) : "";
                String p2OptB = p2.options().size() > 1 ? p2.options().get(1) : "";
                String p2OptC = p2.options().size() > 2 ? p2.options().get(2) : "";
                String p2OptD = p2.options().size() > 3 ? p2.options().get(3) : "";

                sec2.addQuestion(new Question("What is Person A's opinion?", p2OptA, p2OptB, p2OptC, p2OptD, "A", "Person A's opinion matches: " + p2OptA));
                sec2.addQuestion(new Question("What is Person B's opinion?", p2OptA, p2OptB, p2OptC, p2OptD, "B", "Person B's opinion matches: " + p2OptB));
                sec2.addQuestion(new Question("What is Person C's opinion?", p2OptA, p2OptB, p2OptC, p2OptD, "C", "Person C's opinion matches: " + p2OptC));
                sec2.addQuestion(new Question("What is Person D's opinion?", p2OptA, p2OptB, p2OptC, p2OptD, "D", "Person D's opinion matches: " + p2OptD));
                test.addSection(sec2);
            }

            // Add Part 3: 1 identifying opinions task per test (recycled from 12 topics)
            if (!part3Shuffled.isEmpty()) {
                int p3Idx = (i - 1) % part3Shuffled.size();
                Part3Json p3 = part3Shuffled.get(p3Idx);
                String audioPath = p3.audioUrl();
                if (audioPath != null && !audioPath.startsWith("http")) {
                    audioPath = BASE_URL + audioPath;
                }

                AudioSection sec3 = new AudioSection(
                        3,
                        "Part 3: Opinion Identification. Listen to a discussion on: " + p3.topic().replace("Topic: ", "") + ". Identify who expresses each opinion.",
                        audioPath,
                        p3.transcript()
                );

                // Add 4 questions, one for each statement
                for (int k = 0; k < 4; k++) {
                    if (k < p3.questions().size() && k < p3.correctAnswer().size()) {
                        String qText = p3.questions().get(k);
                        String ans = p3.correctAnswer().get(k); // "Man", "Woman", or "Both"
                        String correctLetter = "C"; // default "Both"
                        if ("Man".equalsIgnoreCase(ans)) {
                            correctLetter = "A";
                        } else if ("Woman".equalsIgnoreCase(ans)) {
                            correctLetter = "B";
                        }

                        sec3.addQuestion(new Question(
                                qText,
                                "Man only",
                                "Woman only",
                                "Both Man and Woman",
                                null,
                                correctLetter,
                                "Correct choice: " + ans
                        ));
                    }
                }
                test.addSection(sec3);
            }

            // Add Part 4: 2 academic lectures per test.
            // 16 tests * 2 lectures = 32 lectures total (drawn from 54)
            if (!part4Shuffled.isEmpty()) {
                for (int k = 0; k < 2; k++) {
                    int idx = ((i - 1) * 2 + k) % part4Shuffled.size();
                    Part4Json p4 = part4Shuffled.get(idx);
                    String audioPath = p4.audioUrl();
                    if (audioPath != null && !audioPath.startsWith("http")) {
                        audioPath = BASE_URL + audioPath;
                    }

                    AudioSection sec4 = new AudioSection(
                            4,
                            "Part 4: Academic Monologue. Listen to a short lecture on: " + p4.topic() + " and answer the multiple choice questions.",
                            audioPath,
                            p4.transcript()
                    );

                    // Add 2 sub-questions
                    for (Part4QuestionJson pq : p4.questions()) {
                        String optA = pq.options().size() > 0 ? pq.options().get(0) : "";
                        String optB = pq.options().size() > 1 ? pq.options().get(1) : "";
                        String optC = pq.options().size() > 2 ? pq.options().get(2) : "";

                        sec4.addQuestion(new Question(
                                pq.question(),
                                optA,
                                optB,
                                optC,
                                null,
                                "A", // Correct answer is always the first option in unshuffled raw options
                                "Correct answer is A: " + optA
                        ));
                    }
                    test.addSection(sec4);
                }
            }

            testRepository.save(test);
            System.out.println("Successfully seeded: " + test.getTitle() + " with " + test.getSections().size() + " sections.");
        }

        System.out.println("Database seeding completed successfully. Generated " + totalTests + " full listening mock tests.");
    }

    // --- Record DTO Classes for JSON Mapping ---
    private record Part1Json(
            String heading,
            String audioUrl,
            String question,
            List<String> options,
            String correctAnswer,
            String transcript
    ) {}

    private record Part2Json(
            String audioUrl,
            String topic,
            List<String> options,
            String transcript
    ) {}

    private record Part3Json(
            String audioUrl,
            String topic,
            String transcript,
            List<String> questions,
            List<String> correctAnswer
    ) {}

    private record Part4QuestionJson(
            String id,
            String question,
            List<String> options
    ) {}

    private record Part4Json(
            String audioUrl,
            String topic,
            List<Part4QuestionJson> questions,
            String transcript
    ) {}
}
