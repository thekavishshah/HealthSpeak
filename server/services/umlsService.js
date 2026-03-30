import axios from 'axios';
import dotenv from 'dotenv';
import Fuse from 'fuse.js'
dotenv.config();

const UMLS_BASE_URL = 'https://uts-ws.nlm.nih.gov/rest';
const UMLS_VERSION = 'current';

function scoreResult(term, umlsWord, umlsScore) {
  const revTerm = term.toLowerCase();
  const revUmlsWord = umlsWord.toLowerCase();
  let score = 0;
  score = score + (1-umlsScore) * 50;
  if (revTerm === revUmlsWord) {
    score = score + 100;
  }
  if(revUmlsWord.includes(revTerm)){
    score = score + 20;
  }
  return score - Math.abs(umlsWord.length - term.length) * 0.3;
}

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
      pageSize: 50,
      returnIdType: 'concept',
      searchType: 'normalizedString'
      //potential additional parameter: searchType: 'normalizedString'
    };

    const searchResponse = await axios.get(searchUrl, { params: searchParams });

    if (!searchResponse.data || !searchResponse.data.result || searchResponse.data.result.results.length === 0) {
      return {
        success: false,
        error: 'No UMLS results found',
        data: null
      };
    }


    

    //We first filter out any names we have gotten in the results where if they contain unspecified, other, or nos
    //They may be a specific version of the main term, but are not as important 
    const cuiResults = searchResponse.data.result.results;
    const cuiClean  = cuiResults.filter(r=>{
      if(!r.name){
        return false;
      }
      const revName = r.name.toLowerCase()
      if (revName.includes("unspecified") || revName.includes("nos") || revName.includes("other")) {
        return false;
      }
      return true;
    })

    //fuse.js is used to do Fuzzy searching between the given search term and each term in the filtered results
    const fuse = new Fuse(cuiClean, {
      keys: ['name'],
      includeScore: true,
      threshold: 0.3
    })
    const cuiFinalRes = fuse.search(term)
    //const sortedCui = cuiFinalRes.sort((a,b) => a.score - b.score)

    //Using map to go through all elements in the cuiFinalRes array after getting the simialrity scores from fuzzy matching
    //We use "...r.item" where ... represent all elements in the r.item object.
    //We add a finalScore attribute to each object i nthe list where we still have for each object a object of items and finalScore
    const scoreCui = cuiFinalRes.map(r=>({
      ...r,
      finalScore: scoreResult(term, r.item.name,r.score)
    }));
    scoreCui.sort((a,b) => b.finalScorecore - a.finalScore)

    

    // Get the first (most relevant) result
    //const firstResult = searchResponse.data.result.results[0];
    /*
    const termWords = term.toLowerCase().split(" ");
    const firstResult = searchResponse.data.result.results.find(
      cui => {
        const word = cui.name.toLowerCase()
        return termWords.every(curWord=> word.includes(curWord));
      })
    */

    const cui = scoreCui[0].item.ui; // Concept Unique Identifier
    const name = scoreCui[0].item.name;

    //const cui = firstResult.ui; // Concept Unique Identifier
    //const name = firstResult.name;

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

    return cleanAndFilterDefinitions(results);

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

function stripHtml(html = "") {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeDefinitionText(text = "") {
  return stripHtml(text)
    .replace(/~/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .trim();
}

function looksEnglish(text = "") {
  if (!text) return false;

  // very lightweight heuristic:
  // reject obvious non-English diacritics-heavy text
  const nonEnglishChars = (text.match(/[ěščřžýáíéúůťďňôäöüßç]/gi) || []).length;
  const asciiChars = (text.match(/[a-z0-9 ,.'()/%:-]/gi) || []).length;

  return asciiChars >= nonEnglishChars * 4;
}

function isUsefulDefinition(text = "") {
  if (!text) return false;
  if (text.length < 40) return false;
  if (/^none$/i.test(text)) return false;
  return true;
}

function dedupeDefinitions(definitions = []) {
  const seen = new Set();

  return definitions.filter((def) => {
    const key = def.value
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function rankDefinitionSource(source = "") {
  const preferred = [
    "MEDLINEPLUS",
    "NCI",
    "HPO",
    "MSH",
    "SNOMEDCT_US"
  ];

  const index = preferred.indexOf(source);
  return index === -1 ? 999 : index;
}

function cleanAndFilterDefinitions(results = []) {
  const cleaned = results
    .map((def) => ({
      source: def.rootSource,
      value: normalizeDefinitionText(def.value),
    }))
    .filter((def) => isUsefulDefinition(def.value))
    .filter((def) => looksEnglish(def.value))
    .filter((def) => !["MSHCZE"].includes(def.source))
    .sort((a, b) => {
      const sourceDiff = rankDefinitionSource(a.source) - rankDefinitionSource(b.source);
      if (sourceDiff !== 0) return sourceDiff;
      return a.value.length - b.value.length; // prefer shorter, cleaner definitions
    });

  return dedupeDefinitions(cleaned).slice(0, 2);
}
