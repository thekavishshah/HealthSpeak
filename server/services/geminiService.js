import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Get medical information for a given term using Gemini AI
 * @param {string} searchTerm - The medical term to search for
 * @returns {Promise<Object>} Medical information object
 */
export async function getMedicalInformation(searchTerm) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a medical information assistant helping patients understand medical terminology in plain language.

Search Term: "${searchTerm}"

Please provide the following information in a structured JSON format:
1. The proper medical term (corrected if needed)
2. A clear, patient-friendly definition (2-3 sentences, avoid jargon)
3. Common symptoms (if applicable, list 4-6 key symptoms)
4. Common causes or risk factors (if applicable, list 4-6 main causes)
5. Related medical terms (list 5-8 related conditions or terms)

Important guidelines:
- Use simple, easy-to-understand language
- Avoid overly technical medical jargon
- If the term is not a medical condition but a symptom, test, or procedure, adjust the response accordingly
- Be accurate and use verified medical knowledge
- Include a disclaimer that this is for educational purposes only

Return ONLY a valid JSON object with this exact structure:
{
  "term": "Medical Term Name",
  "definition": "Clear patient-friendly definition...",
  "symptoms": ["symptom 1", "symptom 2", "symptom 3", "symptom 4"],
  "causes": ["cause 1", "cause 2", "cause 3", "cause 4"],
  "relatedTerms": ["term 1", "term 2", "term 3", "term 4", "term 5"],
  "disclaimer": "This information is for educational purposes only. Please consult with a healthcare professional for medical advice, diagnosis, or treatment."
}

If the search term is not recognized as a medical term, return:
{
  "term": "${searchTerm}",
  "definition": "We couldn't find medical information for this term. Please try rephrasing or searching for a different term.",
  "symptoms": [],
  "causes": [],
  "relatedTerms": [],
  "disclaimer": "This information is for educational purposes only."
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from the response (remove markdown code blocks if present)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }

    const medicalInfo = JSON.parse(jsonText);

    return {
      success: true,
      data: medicalInfo
    };

  } catch (error) {
    console.error('Error fetching medical information:', error);

    return {
      success: false,
      error: error.message,
      data: {
        term: searchTerm,
        definition: "We encountered an error retrieving this information. Please try again later.",
        symptoms: [],
        causes: [],
        relatedTerms: [],
        disclaimer: "This information is for educational purposes only."
      }
    };
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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
  getMedicalInformation,
  getChatResponse
};
