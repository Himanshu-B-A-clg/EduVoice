/**
 * Text Simplification Service
 * Provides simplified explanations and alternative words for difficult text
 * 
 * INTEGRATION NOTE: For production, integrate with:
 * - OpenAI GPT-4 for contextual simplification
 * - Anthropic Claude for nuanced explanations
 * - Custom fine-tuned models for dyslexia-specific simplification
 * - WordNet or similar for synonym suggestions
 */

export class SimplificationService {
  constructor() {
    // Mock database of common difficult words and their simplifications
    this.simplificationDatabase = {
      'difficult': {
        simple: 'hard',
        explanation: 'Something that is not easy to do or understand.',
        example: 'This puzzle is hard to solve.',
      },
      'magnificent': {
        simple: 'amazing',
        explanation: 'Something very beautiful or impressive.',
        example: 'The sunset was amazing.',
      },
      'enormous': {
        simple: 'huge',
        explanation: 'Very, very big.',
        example: 'The elephant is huge.',
      },
      'frightened': {
        simple: 'scared',
        explanation: 'Feeling afraid of something.',
        example: 'The cat was scared of the dog.',
      },
      'exhausted': {
        simple: 'very tired',
        explanation: 'When you feel like you have no energy left.',
        example: 'After running, I felt very tired.',
      },
      'peculiar': {
        simple: 'strange',
        explanation: 'Something that seems odd or different.',
        example: 'That is a strange hat!',
      },
      'ancient': {
        simple: 'very old',
        explanation: 'Something from a long, long time ago.',
        example: 'The pyramids are very old.',
      },
      'delicious': {
        simple: 'yummy',
        explanation: 'Food that tastes really good.',
        example: 'This cake is yummy!',
      },
    };
  }

  /**
   * Get simplified version of a word or phrase
   * In production, this calls the LLM API
   */
  async simplifyWord(word, context = '') {
    const lowerWord = word.toLowerCase().trim();

    // Check cached/fast database first for instant results
    if (this.simplificationDatabase[lowerWord]) {
      return {
        original: word,
        simplified: this.simplificationDatabase[lowerWord].simple,
        explanation: this.simplificationDatabase[lowerWord].explanation,
        example: this.simplificationDatabase[lowerWord].example,
        context,
        confidence: 0.95,
      };
    }

    try {
      const response = await fetch('${import.meta.env.VITE_API_URL}/api/simplify-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, context })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          original: word,
          simplified: data.simplified,
          explanation: data.explanation,
          example: data.example,
          context,
          confidence: 0.9
        };
      }
    } catch (e) {
      console.warn("Backend simplification failed, using fallback:", e);
    }

    // Generate mock simplification for unknown words (Fallback)
    return this.generateMockSimplification(word, context);
  }

  /**
   * Simplify an entire sentence
   */
  async simplifySentence(sentence) {
    await this.delay(400);

    // Mock simplification
    const simplified = sentence
      .replace(/magnificent/gi, 'amazing')
      .replace(/enormous/gi, 'huge')
      .replace(/frightened/gi, 'scared')
      .replace(/exhausted/gi, 'very tired')
      .replace(/peculiar/gi, 'strange')
      .replace(/ancient/gi, 'very old')
      .replace(/delicious/gi, 'yummy');

    return {
      original: sentence,
      simplified,
      changes: this.findChanges(sentence, simplified),
    };
  }

  /**
   * Get pronunciation help for a word
   */
  async getPronunciationHelp(word) {
    await this.delay(200);

    // Mock syllable breakdown
    const syllables = this.breakIntoSyllables(word);

    return {
      word,
      syllables,
      phonetic: this.getPhonetic(word),
      tips: `Try saying it slowly: ${syllables.join(' - ')}`,
    };
  }

  /**
   * Get contextual definition
   */
  async getDefinition(word, sentence = '') {
    await this.delay(300);

    const lowerWord = word.toLowerCase().trim();

    if (this.simplificationDatabase[lowerWord]) {
      return {
        word,
        definition: this.simplificationDatabase[lowerWord].explanation,
        example: this.simplificationDatabase[lowerWord].example,
        simpleWord: this.simplificationDatabase[lowerWord].simple,
      };
    }

    return {
      word,
      definition: `A word that means something related to "${word}".`,
      example: `Here's how to use "${word}" in a sentence.`,
      simpleWord: word,
    };
  }

  /**
   * MOCK: Generate simplification when not in database
   * In production, call LLM API like OpenAI GPT-4
   */
  generateMockSimplification(word, context) {
    // Create contextual simplifications based on common word patterns
    const lowerWord = word.toLowerCase();

    // Common word patterns and their simplifications
    const patterns = {
      // Words ending in -ly
      'quickly': { simple: 'fast', explanation: 'Moving with speed.', example: 'The rabbit ran fast.' },
      'slowly': { simple: 'slow', explanation: 'Not moving fast.', example: 'The turtle moved slow.' },
      'carefully': { simple: 'with care', explanation: 'Being gentle and paying attention.', example: 'Hold the baby with care.' },

      // Action words
      'approached': { simple: 'came near', explanation: 'Moved closer to something.', example: 'The dog came near the food.' },
      'discovered': { simple: 'found', explanation: 'Finding something new or hidden.', example: 'I found a treasure!' },
      'observed': { simple: 'watched', explanation: 'Looking at something carefully.', example: 'We watched the birds.' },

      // Description words
      'curious': { simple: 'interested', explanation: 'Wanting to know or learn about something.', example: 'I am interested in space.' },
      'beautiful': { simple: 'pretty', explanation: 'Something that looks very nice.', example: 'The flower is pretty.' },
      'tiny': { simple: 'very small', explanation: 'Something that is not big at all.', example: 'The ant is very small.' },
      'gigantic': { simple: 'giant', explanation: 'Extremely big in size.', example: 'The building is giant.' },

      // Common words
      'the': { simple: 'the', explanation: 'A word used before things we talk about.', example: 'The cat sat on the mat.' },
      'and': { simple: 'and', explanation: 'A word that connects two things.', example: 'I like cats and dogs.' },
      'here': { simple: 'at this place', explanation: 'The place where you are right now.', example: 'Come at this place.' },
      'there': { simple: 'at that place', explanation: 'A place that is not here.', example: 'Go at that place.' },
    };

    // Check if we have a specific pattern
    if (patterns[lowerWord]) {
      return {
        original: word,
        simplified: patterns[lowerWord].simple,
        explanation: patterns[lowerWord].explanation,
        example: patterns[lowerWord].example,
        context,
        confidence: 0.85,
        note: 'MOCK_RESPONSE - Integrate real LLM for production',
      };
    }

    // Generate a more intelligent mock based on word characteristics
    let simplified, explanation, example;

    if (lowerWord.length <= 3) {
      // Short words - probably don't need simplification
      simplified = word;
      explanation = `"${word}" is a simple word.`;
      example = `The word "${word}" is easy to use.`;
    } else if (lowerWord.endsWith('ed')) {
      // Past tense verbs
      const base = lowerWord.slice(0, -2);
      simplified = `${base} (past)`;
      explanation = `"${word}" means something that already happened.`;
      example = `Yesterday, it ${base}.`;
    } else if (lowerWord.endsWith('ing')) {
      // Present continuous
      const base = lowerWord.slice(0, -3);
      simplified = `${base} now`;
      explanation = `"${word}" means doing ${base} right now.`;
      example = `I am ${base}ing right now.`;
    } else {
      // Generic simplification with better variety
      const alternatives = [
        { simple: 'another way to say it', explanation: `"${word}" can be said in a simpler way.` },
        { simple: 'easier word', explanation: `Think of "${word}" as an easier word.` },
        { simple: 'simple version', explanation: `"${word}" has a simpler version you can use.` },
      ];

      const chosen = alternatives[word.length % alternatives.length];
      simplified = chosen.simple;
      explanation = chosen.explanation;
      example = `Try the simpler word instead of "${word}".`;
    }

    return {
      original: word,
      simplified,
      explanation,
      example,
      context,
      confidence: 0.7,
      note: 'MOCK_RESPONSE - Integrate real LLM for production',
    };
  }

  /**
   * Break word into syllables (simplified mock)
   */
  breakIntoSyllables(word) {
    // Very simple syllable breaking
    const vowels = 'aeiouy';
    const syllables = [];
    let current = '';

    for (let i = 0; i < word.length; i++) {
      current += word[i];
      if (vowels.includes(word[i].toLowerCase()) && i < word.length - 1) {
        if (!vowels.includes(word[i + 1].toLowerCase())) {
          syllables.push(current);
          current = '';
        }
      }
    }

    if (current) syllables.push(current);
    return syllables.length > 0 ? syllables : [word];
  }

  /**
   * Get phonetic representation (mock)
   */
  getPhonetic(word) {
    // In production, use a phonetic API
    return `/${word.toLowerCase()}/`;
  }

  /**
   * Find changes between original and simplified text
   */
  findChanges(original, simplified) {
    const origWords = original.split(/\s+/);
    const simpWords = simplified.split(/\s+/);
    const changes = [];

    for (let i = 0; i < origWords.length; i++) {
      if (origWords[i] !== simpWords[i]) {
        changes.push({
          position: i,
          original: origWords[i],
          simplified: simpWords[i],
        });
      }
    }

    return changes;
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * PRODUCTION INTEGRATION EXAMPLE:
 * 
 * import OpenAI from 'openai';
 * 
 * async simplifyWordWithLLM(word, context) {
 *   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
 *   
 *   const prompt = `Given the word "${word}" in context: "${context}"
 *   Provide:
 *   1. A simpler alternative suitable for someone with dyslexia
 *   2. A one-sentence explanation (max 15 words)
 *   3. A simple example sentence
 *   
 *   Format as JSON.`;
 *   
 *   const response = await openai.chat.completions.create({
 *     model: 'gpt-4',
 *     messages: [{ role: 'user', content: prompt }],
 *     temperature: 0.3,
 *   });
 *   
 *   return JSON.parse(response.choices[0].message.content);
 * }
 */

export default SimplificationService;

