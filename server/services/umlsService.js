import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const UMLS_BASE_URL = 'https://uts-ws.nlm.nih.gov/rest';
const UMLS_VERSION = 'current';

/**
 * Search UMLS for medical term and get CUI (Concept Unique Identifier)
 * @param {string} term - The medical term to search for
 * @returns {Promise<Object>} UMLS search results with CUI and concept information
 */
export async function searchUMLSTerm(term) {
  try {
    const apiKey = process.env.UMLS_API_KEY;

    if (!apiKey) {
      console.warn('UMLS_API_KEY not found in environment variables');
      return { success: false, error: 'UMLS API key not configured' };
    }

    // Search for the term
    const searchUrl = `${UMLS_BASE_URL}/search/${UMLS_VERSION}`;
    const searchParams = {
      string: term,
      apiKey: apiKey,
      pageSize: 5,
      returnIdType: 'concept'
    };

    const searchResponse = await axios.get(searchUrl, { params: searchParams });

    if (!searchResponse.data || !searchResponse.data.result || searchResponse.data.result.results.length === 0) {
      return {
        success: false,
        error: 'No UMLS results found',
        data: null
      };
    }

    // Get the first (most relevant) result
    const firstResult = searchResponse.data.result.results[0];
    const cui = firstResult.ui; // Concept Unique Identifier
    const name = firstResult.name;

    // Fetch detailed concept information
    const conceptData = await getConceptDetails(cui, apiKey);

    // Fetch definitions
    const definitions = await getConceptDefinitions(cui, apiKey);

    // Fetch relations (for related terms)
    const relations = await getConceptRelations(cui, apiKey);

    return {
      success: true,
      data: {
        cui: cui,
        preferredName: name,
        semanticTypes: conceptData.semanticTypes || [],
        definitions: definitions,
        sourceVocabularies: conceptData.sourceVocabularies || [],
        icd10Codes: conceptData.icd10Codes || [],
        snomedCodes: conceptData.snomedCodes || [],
        relatedConcepts: relations.relatedConcepts || [],
        atoms: conceptData.atoms || []
      }
    };

  } catch (error) {
    console.error('UMLS API Error:', error.message);

    // Check for specific error types
    if (error.response) {
      // API returned an error response
      return {
        success: false,
        error: `UMLS API error: ${error.response.status} - ${error.response.statusText}`,
        data: null
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        success: false,
        error: 'UMLS API is unreachable',
        data: null
      };
    } else {
      // Something else went wrong
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }
}

/**
 * Get detailed concept information from UMLS
 * @param {string} cui - Concept Unique Identifier
 * @param {string} apiKey - UMLS API key
 * @returns {Promise<Object>} Detailed concept information
 */
async function getConceptDetails(cui, apiKey) {
  try {
    const conceptUrl = `${UMLS_BASE_URL}/content/${UMLS_VERSION}/CUI/${cui}`;
    const response = await axios.get(conceptUrl, {
      params: { apiKey }
    });

    const result = response.data.result;

    // Extract semantic types
    const semanticTypes = result.semanticTypes?.map(st => ({
      name: st.name,
      uri: st.uri
    })) || [];

    // Get atoms to find codes from different vocabularies
    const atomsUrl = `${UMLS_BASE_URL}/content/${UMLS_VERSION}/CUI/${cui}/atoms`;
    const atomsResponse = await axios.get(atomsUrl, {
      params: {
        apiKey,
        pageSize: 50,
        sabs: 'ICD10CM,SNOMEDCT_US,MSH' // Focus on major vocabularies
      }
    });

    const atoms = atomsResponse.data.result || [];

    // Extract ICD-10 codes
    const icd10Codes = atoms
      .filter(atom => atom.rootSource === 'ICD10CM')
      .map(atom => ({
        code: atom.code,
        name: atom.name
      }))
      .slice(0, 5); // Limit to 5 codes

    // Extract SNOMED CT codes
    const snomedCodes = atoms
      .filter(atom => atom.rootSource === 'SNOMEDCT_US')
      .map(atom => ({
        code: atom.code,
        name: atom.name
      }))
      .slice(0, 5);

    // Extract source vocabularies
    const sourceVocabularies = [...new Set(atoms.map(atom => atom.rootSource))];

    return {
      semanticTypes,
      sourceVocabularies,
      icd10Codes,
      snomedCodes,
      atoms: atoms.slice(0, 10) // Keep first 10 atoms for reference
    };

  } catch (error) {
    console.error('Error fetching concept details:', error.message);
    return {
      semanticTypes: [],
      sourceVocabularies: [],
      icd10Codes: [],
      snomedCodes: [],
      atoms: []
    };
  }
}

/**
 * Get definitions for a concept from UMLS
 * @param {string} cui - Concept Unique Identifier
 * @param {string} apiKey - UMLS API key
 * @returns {Promise<Array>} Array of definitions
 */
async function getConceptDefinitions(cui, apiKey) {
  try {
    const definitionsUrl = `${UMLS_BASE_URL}/content/${UMLS_VERSION}/CUI/${cui}/definitions`;
    const response = await axios.get(definitionsUrl, {
      params: { apiKey, pageSize: 5 }
    });

    const results = response.data.result || [];

    return results.map(def => ({
      source: def.rootSource,
      value: def.value
    }));

  } catch (error) {
    console.error('Error fetching definitions:', error.message);
    return [];
  }
}

/**
 * Get related concepts from UMLS
 * @param {string} cui - Concept Unique Identifier
 * @param {string} apiKey - UMLS API key
 * @returns {Promise<Object>} Related concepts information
 */
async function getConceptRelations(cui, apiKey) {
  try {
    const relationsUrl = `${UMLS_BASE_URL}/content/${UMLS_VERSION}/CUI/${cui}/relations`;
    const response = await axios.get(relationsUrl, {
      params: {
        apiKey,
        pageSize: 10
      }
    });

    const results = response.data.result || [];

    // Extract related concept CUIs and names
    const relatedConcepts = results
      .filter(rel => rel.relatedIdName) // Only relations with names
      .map(rel => ({
        cui: rel.relatedId,
        name: rel.relatedIdName,
        relationLabel: rel.relationLabel
      }))
      .slice(0, 5); // Limit to 5 related concepts

    return { relatedConcepts };

  } catch (error) {
    console.error('Error fetching relations:', error.message);
    return { relatedConcepts: [] };
  }
}

/**
 * Get crosswalk/mapping between different code systems
 * @param {string} sourceVocab - Source vocabulary (e.g., 'SNOMEDCT_US')
 * @param {string} sourceCode - Source code
 * @param {string} apiKey - UMLS API key
 * @returns {Promise<Array>} Mapped codes in other systems
 */
export async function getCrosswalk(sourceVocab, sourceCode, apiKey) {
  try {
    const crosswalkUrl = `${UMLS_BASE_URL}/crosswalk/${UMLS_VERSION}/source/${sourceVocab}/${sourceCode}`;
    const response = await axios.get(crosswalkUrl, {
      params: { apiKey }
    });

    return response.data.result || [];

  } catch (error) {
    console.error('Error fetching crosswalk:', error.message);
    return [];
  }
}

export default {
  searchUMLSTerm,
  getCrosswalk
};
