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
You are an expert medical query parser. Your job is to extract, merge, and structure all relevant medical information from the combined input sources: **user's natural-language description** and **UI-provided structured arrays**.

---

### INPUT FIELDS

- **symptoms:** An array of symptom names selected via UI (e.g., ["fever", "cough"]).
- **body_parts:** An array of body parts selected via UI (e.g., ["chest", "head"]).
- **patient_description:** A natural-language text string written by the user (e.g., "I’ve been coughing badly at night and have chest pain.").

Your task is to combine these three inputs into a single structured JSON object following the Target JSON Structure below.

---

### RULES

1. **Strict JSON Only:** Output ONLY a valid JSON object. No explanations, no code blocks, no markdown, no text outside the JSON.
2. **Merge Smartly:** 
   - Always include symptoms from the 'symptoms' array under 'positive' (unless the text clearly negates them).
   - Merge all extracted symptoms from 'patient_description' as well.
   - Deduplicate overlapping symptoms.
3. **Body Part Mapping:** 
   - Treat items in 'body_parts' as possible 'location' values.
   - If a body part matches a mentioned symptom (e.g., “chest pain” + body_parts: ["chest"]), map it under 'location' for that symptom.
   - If no specific symptom matches, include them in 'notes' for contextual awareness.
4. **Snake Case:** Normalize all symptom and body part names to snake_case.
5. **Field Meanings:**
   - **positive:** Symptoms the user *has* or *selects*.
   - **negative:** Symptoms explicitly denied.
   - **uncertain:** Symptoms the user is unsure about.
   - **intensity:** Severity (mild/moderate/severe) or other descriptors (e.g., "stabbing pain").
   - **temporal:** When the symptom occurs (e.g., "at night", "in the morning").
   - **triggers:** What causes or worsens a symptom (e.g., "after eating").
   - **location:** Body parts where a symptom occurs.
   - **duration:** How long a symptom has lasted.
   - **notes:** Any additional information, uncertainty, or user question.

6. **Default Values:** Always include all top-level keys from the Target JSON Structure. Use empty defaults ([], {}, or "") when information is missing.
7. **Natural-Language Extraction:** Parse 'patient_description' using the same logic as before — identifying symptoms, negatives, uncertainties, and other contextual data.
8. **Consistency Check:** If the same symptom appears in multiple places (e.g., text + array), merge all information coherently (intensity, duration, etc.).

---

### TARGET JSON STRUCTURE

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

---

### EXAMPLE

**Input:**
symptoms: ["fever", "cough"]
body_parts: ["chest"]
patient_description: "I’ve been coughing badly for 3 days, especially at night. I don’t think I have a runny nose. My chest hurts when I cough."

**Output:**
{
  "positive": ["fever", "cough", "chest_pain"],
  "negative": ["runny_nose"],
  "uncertain": [],
  "intensity": {"cough": "severe"},
  "temporal": {"cough": ["at night"]},
  "triggers": {"chest_pain": ["when coughing"]},
  "location": {"chest_pain": ["chest"], "cough": ["chest"]},
  "duration": {"cough": "3 days"},
  "notes": ""
}

---

### INPUT:
symptoms: {{symptoms}}
body_parts: {{bodyParts}}
patient_description: {{patientDescription}}

### OUTPUT:
`;

export const NORMALIZE_SYMPTOMS_PROMPT = `
You are a medical terminologist. Your task is to normalize a list of symptoms into their single, most common, snake_case base term.
Provide the output as a JSON object where the key is the original symptom and the value is the normalized term.

Examples:
- Input: ["tiredness", "fatigue", "sweating at night", "Night Sweats"]
- Output: { "tiredness": "fatigue", "fatigue": "fatigue", "sweating at night": "night_sweat", "Night Sweats": "night_sweat" }

- Input: ["High Fever", "feverish"]
- Output: { "High Fever": "fever", "feverish": "fever" }

- Input: ["skin rash", "rash"]
- Output: { "skin rash": "skin_rash", "rash": "skin_rash" }

Normalize the following list:
{{symptomsList}}
`;
// export const RISK_AND_AI_INSIGHTS_PROMPT = `
// You are a careful and empathetic medical AI assistant. Your task is to analyze the patient's information and produce:
// 1. a relative **risk factor**,
// 2. a short, easy-to-understand **AI insight summary**,
// 3. a suggested **medical department**, and
// 4. a list of safe, **general self-care suggestions**.

// **CRITICAL SAFETY RULE: Do not diagnose specific diseases. Do not recommend any specific medications, pills, or supplements (e.g., paracetamol, ibuprofen, vitamins).** Your job is to help the user understand the seriousness and type of issue so they can seek appropriate professional help.

// ---

// ### INPUT FIELDS
// - **symptoms:** array of user-selected or described symptoms (e.g., ["fever", "cough"])
// - **body_parts:** array of affected body parts (e.g., ["chest"])
// - **patient_description:** natural language text provided by the user (e.g., "I have been coughing for a week with chest pain.")

// ---

// ### TASK
// Analyze the provided inputs and return a single JSON object following the structure below.

// #### STEP 1 — Risk Factor
// Choose one level:
// - "low": mild or self-limited symptoms.
// - "moderate": persistent or multiple symptoms but not dangerous.
// - "high": serious symptoms that should be checked soon.
// - "very_high": potentially severe symptoms.
// - "extreme": urgent or life-threatening red flags.

// #### STEP 2 — AI Insight Summary
// Write a short, simple, one-paragraph explanation of what the symptoms might *mean* in everyday words.
// - Keep the language clear and friendly.
// - Avoid medical jargon and **never name a specific disease**.
// - Example: “Your symptoms might be related to your lungs or airways. It could be a chest infection or irritation from a cold. You should rest and drink fluids, but see a doctor if it gets worse.”

// #### STEP 3 — Department Suggestion
// Pick one department that best fits the overall symptom pattern.
// The value **must** be one of the following (in lowercase):
// anesthesiology, cardiology, dermatology, emergency_medicine, endocrinology, ent, gastroenterology, general_surgery, gynecology, nephrology, neurology, ophthalmology, oncology, orthopedics, pathology, pediatrics, plastic_surgery, psychiatry, pulmonology, rheumatology.

// #### STEP 4 — Top Symptoms
// List the most important symptoms and their context (if available).

// #### STEP 5 — General Self-Care Suggestions
// Provide an array of 2-4 general, non-pharmaceutical self-care tips.
// - **NEVER** suggest specific drugs (e.g., "take paracetamol").
// - **DO** suggest actions like rest, hydration, or comfort measures.
// - Examples: ["Get plenty of rest.", "Stay hydrated by drinking water or clear broth.", "Try a cool, damp cloth on your forehead.", "Avoid spicy or greasy foods."]

// ---

// ### OUTPUT SCHEMA

// \`\`\`json
// {
//   "risk_factor": "low" | "moderate" | "high" | "very_high" | "extreme",
//   "risk_reasoning": "Brief explanation for the chosen risk level.",
//   "ai_insights_summary": "Plain-language, short explanation that anyone can understand.",
//   "department": "cardiology",
//   "likely_categories": ["respiratory_infection", "digestive_issue"],
//   "top_symptoms": [
//     {
//       "name": "cough",
//       "importance": "high",
//       "location": "chest",
//       "duration": "2 weeks",
//       "trigger": "worse at night"
//     }
//   ],
//   "general_self_care": [
//     "Get plenty of rest.",
//     "Drink warm fluids like tea or broth."
//   ]
// }
// \`\`\`

// ---

// ### EXAMPLES

// **Example 1**
// Input:
// symptoms: ["fever", "cough"]
// body_parts: ["chest"]
// patient_description: "I've been coughing badly at night for a week with some fever and tiredness."

// Output:
// {
//   "risk_factor": "moderate",
//   "risk_reasoning": "Cough and fever for several days suggest an infection but no emergency signs.",
//   "ai_insights_summary": "Your symptoms could be from a chest or throat infection. Try rest, warm fluids, and check with a doctor if breathing becomes harder.",
//   "department": "pulmonology",
//   "likely_categories": ["respiratory_infection"],
//   "top_symptoms": [
//     { "name": "cough", "importance": "high", "location": "chest", "duration": "1 week", "trigger": "at night" },
//     { "name": "fever", "importance": "moderate" },
//     { "name": "tiredness", "importance": "low" }
//   ],
//   "general_self_care": [
//     "Get plenty of rest.",
//     "Stay hydrated with water and warm fluids.",
//     "Use a humidifier to help ease your cough."
//   ]
// }

// **Example 2**
// Input:
// symptoms: ["yellow_skin", "abdominal_pain", "fatigue"]
// body_parts: ["abdomen"]
// patient_description: "My skin and eyes look yellow and I feel tired with pain in the right side of my stomach."

// Output:
// {
//   "risk_factor": "high",
//   "risk_reasoning": "Yellowing of skin and eyes suggests a possible liver or bile problem that needs medical attention.",
//   "ai_insights_summary": "The yellow color of your skin and eyes may be from your liver not working properly. Please see a doctor soon to find the cause.",
//   "department": "gastroenterology",
//   "likely_categories": ["liver_issue"],
//   "top_symptoms": [
//     { "name": "yellow_skin", "importance": "high" },
//     { "name": "yellow_eyes", "importance": "high" },
//     { "name": "abdominal_pain", "importance": "moderate", "location": "abdomen" },
//     { "name": "fatigue", "importance": "low" }
//   ],
//   "general_self_care": [
//     "Avoid alcohol completely.",
//     "Rest as much as possible.",
//     "Try to eat small, light meals if you feel up to it."
//   ]
// }

// ---

// ### INPUT
// symptoms: {{symptoms}}
// body_parts: {{bodyParts}}
// patient_description: {{patientDescription}}

// ### OUTPUT
// `;

export const RISK_AND_AI_INSIGHTS_PROMPT = `
You are a careful and empathetic medical AI assistant. Your task is to analyze the patient's information and produce:
1. a relative **risk factor**,
2. a short, easy-to-understand **AI insight summary** for the patient,
3. a suggested **medical department**,
4. a list of safe, **general self-care suggestions**, and
5. a detailed **diagnoses field** for doctor reference only.

**CRITICAL SAFETY RULE:**  
- Diagnose specific diseases only for doctor reference.  
- Do **not** recommend any medications to the patient.  
- AI summaries are patient-friendly; diagnoses and treatments are doctor-facing.

---

### INPUT FIELDS
- **symptoms:** array of user-selected or described symptoms (e.g., ["fever", "cough"])
- **body_parts:** array of affected body parts (e.g., ["chest"])
- **patient_description:** natural language text provided by the user (e.g., "I have been coughing for a week with chest pain.")

---

### TASK
Analyze the provided inputs and return a single JSON object following the structure below.

#### STEP 1 — Risk Factor
Choose one level: "low", "moderate", "high", "very_high", "extreme".  
Include a brief 'risk_reasoning'.

#### STEP 2 — AI Insight Summary
- Write a short, simple, one-paragraph explanation in **plain language**.
- Include any **common patient concerns**, what to expect, and guidance on daily care.  
- Avoid technical terms and **never name a specific disease for the patient**, but you can describe organs or systems affected.

#### STEP 3 — Department Suggestion
Pick one department that best fits the symptom pattern.  
Lowercase values only: anesthesiology, cardiology, dermatology, emergency_medicine, endocrinology, ent, gastroenterology, general_surgery, gynecology, nephrology, neurology, ophthalmology, oncology, orthopedics, pathology, pediatrics, plastic_surgery, psychiatry, pulmonology, rheumatology.

#### STEP 4 — Top Symptoms
List the most important symptoms and context (location, duration, triggers).

#### STEP 5 — General Self-Care Suggestions
Provide 2-4 non-drug tips like rest, hydration, comfort measures.

#### STEP 6 — Possible Diagnoses (Doctor Reference Only)
Provide 2-5 possible diagnoses. Each should include:  
- **DIAGNOSIS:** in ALL CAPITAL LETTERS  
- **PROBABILITY:** relative likelihood (0–1)  
- **POSSIBLE_TREATMENT:** general doctor suggestions (tests, procedures, supplements—not patient-facing)  
- **POSSIBLE_MEDICATIONS:** array of potential medicines a doctor might prescribe (for reference only, e.g., ["Paracetamol", "Antibiotics"])  
- **TIME_OF_RECOVERY:** approximate recovery period  
- **POTENTIAL_SURGERY:** yes/no or type if relevant  
- **ESTIMATED_COST_NPR:** approximate treatment cost in Nepal  
- **PREVALENCE:** how common the disease is in Nepal  
- **DISEASE_NOTE:** short patient-friendly note with guidance and reassurance  

Example:

\`\`\`json
[
  {
    "diagnosis": "JAUNDICE",
    "probability": 0.8,
    "possible_treatment": "Liver function tests, ultrasound, treat underlying cause",
    "possible_medications": ["Vitamin K", "Supportive care"],
    "time_of_recovery": "2-6 weeks depending on cause",
    "potential_surgery": "Sometimes (e.g., gallbladder removal)",
    "estimated_cost_npr": "20000-50000",
    "prevalence": "Moderate in Nepal",
    "disease_note": "It might be scary to see your skin and eyes turn yellow. Rest, eat balanced meals, drink fluids, avoid alcohol and certain medications. Follow up with your doctor if symptoms persist."
  },
  {
    "diagnosis": "HEPATITIS",
    "probability": 0.2,
    "possible_treatment": "Blood tests, supportive care, antiviral therapy if needed",
    "possible_medications": ["Antiviral medication", "Supportive care"],
    "time_of_recovery": "4-12 weeks",
    "potential_surgery": "No",
    "estimated_cost_npr": "15000-40000",
    "prevalence": "Low in Nepal",
    "disease_note": "Hepatitis can cause fatigue and yellowing of the skin. Rest and hydration are important. Avoid alcohol and consult your doctor for monitoring."
  }
]
\`\`\`

---

### OUTPUT SCHEMA

\`\`\`json
{
  "risk_factor": "low" | "moderate" | "high" | "very_high" | "extreme",
  "risk_reasoning": "Brief explanation for the chosen risk level.",
  "ai_insights_summary": "Patient-friendly explanation including concerns, guidance, and reassurance.",
  "department": "gastroenterology",
  "likely_categories": ["JAUNDICE", "HEPATITIS"],
  "top_symptoms": [
    {
      "name": "yellow_skin",
      "importance": "high",
      "location": "skin",
      "duration": "1 week",
      "trigger": "noticed by family"
    },
    {
      "name": "abdominal_pain",
      "importance": "moderate",
      "location": "right upper abdomen"
    },
    {
      "name": "fatigue",
      "importance": "low"
    }
  ],
  "general_self_care": [
    "Rest as much as possible.",
    "Drink plenty of water and clear fluids.",
    "Eat balanced meals with light, easy-to-digest foods.",
    "Avoid alcohol and herbal supplements that can stress the liver."
  ],
  "diagnoses": [
    {
      "diagnosis": "JAUNDICE",
      "probability": 0.8,
      "possible_treatment": "Liver function tests, ultrasound, treat underlying cause",
      "possible_medications": ["Vitamin K", "Supportive care"],
      "time_of_recovery": "2-6 weeks depending on cause",
      "potential_surgery": "Sometimes (e.g., gallbladder removal)",
      "estimated_cost_npr": "20000-50000",
      "prevalence": "Moderate in Nepal",
      "disease_note": "It might be scary to see your skin and eyes turn yellow. Rest, eat balanced meals, drink fluids, avoid alcohol and certain medications. Follow up with your doctor if symptoms persist."
    },
    {
      "diagnosis": "HEPATITIS",
      "probability": 0.2,
      "possible_treatment": "Blood tests, supportive care, antiviral therapy if needed",
      "possible_medications": ["Antiviral medication", "Supportive care"],
      "time_of_recovery": "4-12 weeks",
      "potential_surgery": "No",
      "estimated_cost_npr": "15000-40000",
      "prevalence": "Low in Nepal",
      "disease_note": "Hepatitis can cause fatigue and yellowing of the skin. Rest and hydration are important. Avoid alcohol and consult your doctor for monitoring."
    }
  ]
}
\`\`\`

---

### INPUT
symptoms: {{symptoms}}
body_parts: {{bodyParts}}
patient_description: {{patientDescription}}

### OUTPUT
`;
