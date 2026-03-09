import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Search for a medical term and get comprehensive information
 * @param {string} term - The medical term to search for
 * @returns {Promise<Object>} Structured medical information
 */
export async function searchMedicalTerm(term) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a medical information assistant for HealthSpeak, a platform that simplifies medical terminology for patients.

Please provide comprehensive information about the medical term: "${term}"

Return your response in the following JSON format:
{
  "term": "the medical term",
  "definition": "a clear, patient-friendly explanation in 2-3 sentences avoiding complex medical jargon",
  "symptoms": ["symptom1", "symptom2", "symptom3", "symptom4", "symptom5", "symptom6"],
  "causes": ["cause1", "cause2", "cause3", "cause4"],
  "relatedTerms": ["related term 1", "related term 2", "related term 3", "related term 4"]
}

Guidelines:
- Use simple, accessible language that a patient without medical training can understand
- For symptoms, provide 6 common symptoms (if applicable)
- For causes, provide 4 common or possible causes
- For related terms, provide 4 medically related concepts
- Keep explanations concise and patient-friendly
- If the term is not a recognized medical term, still provide the best information possible

Return ONLY the JSON object, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Clean up the response to extract JSON
    let jsonText = text.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    // Parse the JSON response
    const parsedResponse = JSON.parse(jsonText);

    return {
      success: true,
      data: parsedResponse
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error(`Failed to fetch medical information: ${error.message}`);
  }
}

/**
 * Generate a conversational response for a medical query
 * @param {string} query - User's question or search query
 * @param {Array} chatHistory - Previous conversation history
 * @returns {Promise<Object>} Response object
 */
export async function getChatResponse(query, chatHistory = []) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const context = `You are a helpful medical information assistant for the HealthSpeak platform.
You help patients understand medical terminology, conditions, and health information in simple, clear language.

Guidelines:
- Provide accurate, evidence-based medical information
- Use plain language that patients can easily understand
- Be empathetic and supportive
- Always include a disclaimer about consulting healthcare professionals
- If asked about symptoms requiring immediate attention, advise seeking emergency care
- Do not provide specific medical diagnoses or treatment recommendations

Previous conversation:
${chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

User Query: ${query}

Provide a helpful, concise response.`;

    const result = await model.generateContent(context);
    const response = result.response;
    const text = response.text();

    return {
      success: true,
      response: text
    };

  } catch (error) {
    console.error('Error generating chat response:', error);

    return {
      success: false,
      error: error.message,
      response: "I'm sorry, I encountered an error. Please try again."
    };
  }
}

export default {
  searchMedicalTerm,
  getChatResponse
};
