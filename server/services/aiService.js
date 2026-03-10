import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Search for a medical term and get comprehensive information
 * @param {string} term - The medical term to search for
 * @returns {Promise<Object>} Structured medical information
 */
export async function searchMedicalTerm(term) {
  try {
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

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful medical information assistant. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const text = completion.choices[0].message.content;

    // Parse the JSON response
    const parsedResponse = JSON.parse(text);

    return {
      success: true,
      data: parsedResponse
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
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
    const systemPrompt = `You are a helpful medical information assistant for the HealthSpeak platform.
You help patients understand medical terminology, conditions, and health information in simple, clear language.

Guidelines:
- Provide accurate, evidence-based medical information
- Use plain language that patients can easily understand
- Be empathetic and supportive
- Always include a disclaimer about consulting healthcare professionals
- If asked about symptoms requiring immediate attention, advise seeking emergency care
- Do not provide specific medical diagnoses or treatment recommendations`;

    // Build messages array with system prompt and chat history
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add chat history (limit to avoid token overflow)
    chatHistory.slice(-10).forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    // Add current query
    messages.push({
      role: 'user',
      content: query
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500
    });

    const responseText = completion.choices[0].message.content;

    return {
      success: true,
      response: responseText
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
