import json
import re
import random

with open('/Users/royce_295/Documents/aptis_demo/scraper/parsed_data.json', 'r') as f:
    raw = json.load(f)

def strip_html(text):
    if not isinstance(text, str):
        return ""
    return re.sub('<[^<]+>', '', text)

result = {
    "part1": [],
    "part2": [],
    "part3": [],
    "part4": []
}

# PART 1 (13 topics)
for i in range(1, 14):
    q1_raw = raw.get(f"questions1_{i}", [])
    p1_questions = []
    for idx, q in enumerate(q1_raw):
        p1_questions.append({
            "id": f"p1_q{idx+1}",
            "text": f"{q.get('questionStart', '')} [blank] {q.get('questionEnd', '')}",
            "options": q.get('answerOptions', []),
            "correctAnswer": q.get('correctAnswer', '')
        })
    result["part1"].append({
        "topicId": i,
        "title": f"Topic: Sentence Comprehension {i}",
        "instructions": "Choose the word that fits in the gap. The first one is done for you.",
        "questions": p1_questions
    })

# PART 2 (39 topics)
for i in range(1, 40):
    q2_raw = raw.get(f"question2Content_{i}", [])
    p2_sentences_ordered = [{"id": f"s{idx+1}", "text": text} for idx, text in enumerate(q2_raw)]
    p2_correct_order = [s["id"] for s in p2_sentences_ordered]
    
    p2_sentences_shuffled = list(p2_sentences_ordered)
    random.shuffle(p2_sentences_shuffled)
    
    result["part2"].append({
        "topicId": i,
        "title": f"Topic: Text Cohesion {i}",
        "instructions": "Put the sentences below in the right order. The first sentence is done for you.",
        "sentences": p2_sentences_shuffled,
        "correctOrder": p2_correct_order
    })

# PART 3 (14 topics)
for i in range(1, 15):
    q4_text_raw = raw.get(f"question4Text_{i}", [])
    text_content = "\n\n".join([strip_html(t) for t in q4_text_raw[1:5]]) if len(q4_text_raw) > 4 else ""
    
    q4_content_raw = raw.get(f"question4Content_{i}", [])
    q4_correct_answers = raw.get(f"correctAnswersQuestion4_{i}", [])
    
    p3_questions = []
    for idx, q in enumerate(q4_content_raw):
        if isinstance(q, dict):
            correct_ans = q.get('answer', None)
            if not correct_ans and idx < len(q4_correct_answers):
                correct_ans = q4_correct_answers[idx]
                
            if correct_ans:
                opts = [o for o in q.get('options', []) if o]
                p3_questions.append({
                    "id": q.get('id', ''),
                    "text": q.get('question', ''),
                    "options": opts,
                    "correctAnswer": correct_ans
                })
            
    result["part3"].append({
        "topicId": i,
        "title": f"Topic: Short Text Matching {i}",
        "instructions": strip_html(q4_text_raw[0]) if len(q4_text_raw) > 0 else "Read the four opinions posted in the forum, and proceed to answer the questions.",
        "text": text_content,
        "questions": p3_questions
    })

# PART 4 (11 topics)
for i in range(1, 12):
    q5_opts = raw.get(f"options_{i}", [])
    q5_paras = raw.get(f"paragraph_question5_{i}", [])
    p4_paragraphs = [{"id": f"p4_para{idx+1}", "text": strip_html(text)} for idx, text in enumerate(q5_paras)]
    
    p4_headings_ordered = []
    for idx, opt in enumerate(q5_opts):
        if opt: 
            p4_headings_ordered.append({"id": f"h{idx}", "text": strip_html(opt)})
            
    p4_correct_answers_map = {}
    for idx in range(len(q5_paras)):
        if idx + 1 < len(q5_opts):
            p4_correct_answers_map[f"p4_para{idx+1}"] = f"h{idx+1}"
            
    p4_headings_shuffled = list(p4_headings_ordered)
    random.shuffle(p4_headings_shuffled)
            
    result["part4"].append({
        "topicId": i,
        "title": f"Topic: Long Text Comprehension {i}",
        "instructions": "Match the headings to the correct paragraphs.",
        "paragraphs": p4_paragraphs,
        "headings": p4_headings_shuffled,
        "correctAnswers": p4_correct_answers_map
    })

with open('/Users/royce_295/Documents/aptis_demo/aptis-listening-fe/public/scraped_data_reading/reading_all.json', 'w') as f:
    json.dump(result, f, indent=2, ensure_ascii=False)

with open('/Users/royce_295/Documents/aptis_demo/aptis-listening-be/src/main/resources/scraped_data/reading_all.json', 'w') as f:
    json.dump(result, f, indent=2, ensure_ascii=False)

print("Decoupled Topics created successfully!")
