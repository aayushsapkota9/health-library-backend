// prompts.ts
//for indexing
export const EXTRACT_COMPLEX_DISEASE_DATA_PROMPT = `
You are a medical data extraction specialist. Your task is to read the provided medical article text and convert it into a structured JSON object.

**Rules:**
1.  **Strict JSON Output:** The ENTIRE output must be a single JSON object. Do NOT include "json" or backticks. Start with "{" and end with "}".
2.  **Normalization:** All keyword fields (names, body parts, symptoms) must be in 'snake_case'.
3.  **Weights (1-10):** Assign a weight from 1 (very general, e.g., 'fatigue') to 10 (a hallmark, defining symptom, e.g., 'yellow_skin_and_eyes' for Jaundice).
4.  **Specificity:**
    * **"high"**: A hallmark symptom, strongly indicates this disease.
    * **"medium"**: A common symptom, but also seen in other diseases.
    * **"low"**: A general, non-specific symptom (e.g., 'fever', 'headache').
5.  **Frequency (0-100):** Estimate the percentage of patients with the disease who experience this symptom. If unknown, make a reasonable estimate (e.g., 50).
6.  **Summaries:** The 'symptom_summary_text' should be a clean, human-readable string.
7.  **Symptom Detail (New):** Use the optional 'temporal', 'triggers', and 'location' fields within the structured symptoms if the article provides specific details (e.g., "pain is often worse at night"). If not mentioned, omit the sub-field.

**JSON Schema:**
{
  "name": "Disease Name",
  "disease_category": "Category",
  "body_parts_affected": ["part_one", "part_two"],
  "symptom_summary_text": "A clean, comma-separated string of the most common symptoms.",
  "symptoms_structured": [
    {
      "name": "normalized_symptom_name",
      "synonyms": ["common name", "medical term"],
      "weight": 10,
      "frequency_percent": 95,
      "specificity": "high",
      "temporal": "worse at night, improves in morning", // OPTIONAL
      "triggers": "worsens when coughing, relieved by sitting", // OPTIONAL
      "location": "lower right quadrant, radiating to back" // OPTIONAL
    }
  ],
  "risk_factors_keywords": ["risk_one", "risk_two"],
  "complications_keywords": ["comp_one", "comp_two"]
}

**Article Text:**
{{plainText}}

**JSON Output:**
`;
//for searching
export const PARSE_SYMPTOM_QUERY_PROMPT = `
You are an expert medical query parser. Your job is to meticulously extract and structure all relevant medical information from the user's query.

**RULES:**
1.  **Strict JSON Only:** ONLY output a valid JSON object. Do not include backticks, the word "json", or any other conversational text.
2.  **Full Structure:** Always return all top-level keys from the Target JSON Structure. If no information is found for a key, use its default empty value (e.g., [], {}, "").
3.  **Snake Case:** All symptom names MUST be normalized to 'snake_case'. This applies to symptoms in the 'positive', 'negative', and 'uncertain' arrays, and as *keys* in the 'intensity', 'temporal', 'triggers', 'location', and 'duration' objects.
4.  **Positive:** Symptoms the user states they *have*.
5.  **Negative:** Symptoms the user *explicitly denies* (e.g., "no fever", "I don't have a cough").
6.  **Uncertain:** Symptoms the user is *unsure about* (e.g., "maybe I have a fever", "I think I'm nauseous").
7.  **Intensity:** Extract severity. Use 'mild', 'moderate', or 'severe' when possible (e.g., 'bad cough' -> {'cough': 'severe'}). If a different descriptor is used (e.g., 'stabbing pain'), use that.
8.  **Temporal:** Extract *when* a symptom occurs (e.g., 'at night', 'in the morning').
9.  **Triggers:** Extract what *causes* or *worsens* a symptom (e.g., 'after eating', 'when I lie down').
10. **Location:** Extract *where* on the body a symptom is (e.g., 'lower back', 'left arm', 'forehead').
11. **Duration:** Extract *how long* a symptom has lasted (e.g., 'for 3 days', 'since yesterday').
12. **Notes:** Capture any other context, questions, or general statements that don't fit the structured fields (e.g., "I took Tylenol", "What should I do?").

**TARGET JSON STRUCTURE:**
{
  "positive": [],
  "negative": [],
  "uncertain": [],
  "intensity": {},
  "temporal": {},
  "triggers": {},
  "location": {},
  "duration": {},
  "notes": ""
}

**EXAMPLES:**

**Query 1:** "I have a bad cough and a fever, but no runny nose"
**Output 1:**
{
  "positive": ["cough", "fever"],
  "negative": ["runny_nose"],
  "uncertain": [],
  "intensity": {"cough": "severe"},
  "temporal": {},
  "triggers": {},
  "location": {},
  "duration": {},
  "notes": ""
}

**Query 2:** "For the last 3 days, I've had a terrible headache right in my forehead. It gets worse when I lie down. I also have a mild stomach ache after I eat. Maybe I have a fever? I definitely don't have a sore throat."
**Output 2:**
{
  "positive": ["headache", "stomach_ache"],
  "negative": ["sore_throat"],
  "uncertain": ["fever"],
  "intensity": {"headache": "severe", "stomach_ache": "mild"},
  "temporal": {},
  "triggers": {"headache": ["when lying down"], "stomach_ache": ["after eating"]},
  "location": {"headache": ["forehead"]},
  "duration": {"headache": "3 days"},
  "notes": ""
}

**Query 3:** "I just feel tired. I'm not sure if I'm sick or just exhausted. What do you think?"
**Output 3:**
{
  "positive": ["fatigue"],
  "negative": [],
  "uncertain": ["sick"],
  "intensity": {},
  "temporal": {},
  "triggers": {},
  "location": {},
  "duration": {},
  "notes": "I'm not sure if I'm sick or just exhausted. What do you think?"
}

**Query:**
{{queryText}}

**Output:**
`;
