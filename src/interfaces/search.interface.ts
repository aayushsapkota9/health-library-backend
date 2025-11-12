//this is used for searching
export interface IParsedQuery {
  positive: string[]; // symptoms user has
  negative: string[]; // symptoms user explicitly does NOT have
  uncertain?: string[]; // symptoms user is unsure about
  intensity?: {
    // optional severity levels per symptom
    [symptom: string]: 'mild' | 'moderate' | 'severe' | string;
  };
  temporal?: {
    // time-related info per symptom
    [symptom: string]: string[]; // e.g., ['morning', 'night']
  };
  triggers?: {
    // factors that worsen or trigger symptoms
    [symptom: string]: string[]; // e.g., ['after eating', 'walking', 'cold exposure']
  };
  location?: {
    // body location info for symptoms
    [symptom: string]: string[]; // e.g., ['lower abdomen', 'stomach', 'back']
  };
  duration?: {
    // how long symptom has been present
    [symptom: string]: string; // e.g., '3 days', 'since yesterday'
  };
  notes?: string; // free text for extra info
}
//these interfaces are used during indexing process
type SymptomStructured = {
  name: string;
  synonyms: string[];
  weight: number;
  frequency_percent: number;
  specificity: 'low' | 'medium' | 'high' | string;
};

//indexing
export type StructuredQuery = {
  name: string;
  disease_category: string;
  body_parts_affected: string[];
  symptom_summary_text: string;
  symptoms_structured: SymptomStructured[];
  risk_factors_keywords: string[];
  complications_keywords: string[];
};
