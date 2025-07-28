const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getShots, updateShot } = require('../../lib/localStorage');

// Initialize Gemini AI - you'll need to add your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Character consistency analyzer
const analyzeCharacterConsistency = (shots, selectedCharacters) => {
  const characterDetails = {};
  
  // Extract details from existing prompts for each character type
  shots.forEach(shot => {
    if (shot.prompt) {
      selectedCharacters.forEach(character => {
        const lowerChar = character.toLowerCase();
        const lowerPrompt = shot.prompt.toLowerCase();
        
        // Look for character mentions and extract surrounding context
        if (lowerPrompt.includes(lowerChar) || 
            (shot.character && shot.character.toLowerCase().includes(lowerChar))) {
          
          if (!characterDetails[character]) {
            characterDetails[character] = {
              appearances: [],
              commonTraits: [],
              costumes: [],
              settings: []
            };
          }
          
          // Extract costume/appearance details
          const costumeMatches = shot.prompt.match(/wearing\s+([^.]+)/gi) || [];
          const appearanceMatches = shot.prompt.match(/She\s+(is\s+wearing|has|wears)\s+([^.]+)/gi) || [];
          
          characterDetails[character].appearances.push({
            shotTitle: shot.title,
            prompt: shot.prompt
          });
          
          costumeMatches.concat(appearanceMatches).forEach(match => {
            characterDetails[character].costumes.push(match);
          });
        }
      });
    }
  });
  
  return characterDetails;
};

// Build comprehensive prompt context
const buildPromptContext = (formData, characterConsistency, shotContext, allShots) => {
  let context = `You are generating prompts for AI video generation for a Dance Moms style reality TV show called "StarQuest" - a dance competition show featuring young dancers (ages 6-13) in a high-pressure competitive environment.

VISUAL STYLE: Reality television cinematography with:
- Handheld camera feel for authenticity
- Bright, harsh competition lighting when on stage
- Dramatic close-ups for emotional moments
- Multiple camera angles capturing reactions
- High-energy, fast-paced editing style

DANCE MOMS ELEMENTS TO INCLUDE:
- Sparkly, colorful dance costumes with sequins and rhinestones
- Dramatic stage makeup and elaborate hairstyles
- Competitive pressure and emotional stakes
- Backstage drama and preparation
- Dance studio environments with mirrors and barres
- Award ceremonies and trophy presentations
- Parent and coach interactions
- Various dance styles (contemporary, jazz, lyrical, hip-hop)

`;

  // Add character consistency information
  if (Object.keys(characterConsistency).length > 0) {
    context += `\nCHARACTER CONSISTENCY (maintain these details):\n`;
    Object.entries(characterConsistency).forEach(([character, details]) => {
      if (details.appearances.length > 0) {
        const latestAppearance = details.appearances[details.appearances.length - 1];
        context += `- ${character}: Based on previous appearances, particularly in "${latestAppearance.shotTitle}"\n`;
        
        // Extract key visual details
        const costumeDetails = details.costumes.slice(-2); // Last 2 costume descriptions
        if (costumeDetails.length > 0) {
          context += `  Costume style: ${costumeDetails.join(', ')}\n`;
        }
      }
    });
  }

  // Add shot details
  context += `\nCURRENT SHOT DETAILS:
- Title: ${shotContext.title}
- Character: ${shotContext.character || 'Not specified'}
- Description: ${shotContext.description || 'Not provided'}

`;

  // Add form data
  if (formData.shotStyle?.length > 0) {
    context += `Shot Style: ${formData.shotStyle.join(', ')}\n`;
  }
  if (formData.setting?.length > 0) {
    context += `Setting: ${formData.setting.join(', ')}\n`;
  }
  if (formData.characters?.length > 0) {
    context += `Character Details: ${formData.characters.join(', ')}\n`;
  }
  if (formData.costume?.length > 0) {
    context += `Wardrobe: ${formData.costume.join(', ')}\n`;
  }
  if (formData.emotion?.length > 0) {
    context += `Emotional Tone: ${formData.emotion.join(', ')}\n`;
  }
  if (formData.additionalDetails) {
    context += `Actions & Details: ${formData.additionalDetails}\n`;
  }

  // Add existing prompts as examples
  const existingPrompts = allShots.filter(shot => shot.prompt && shot.prompt.trim()).slice(0, 5);
  if (existingPrompts.length > 0) {
    context += `\nEXAMPLE PROMPTS FROM THIS PROJECT (match this style and length):\n`;
    existingPrompts.forEach((shot, index) => {
      context += `${index + 1}. "${shot.prompt}"\n\n`;
    });
  }

  context += `\nGENERATE: A single paragraph prompt (2-4 sentences maximum) in the exact same style and length as the examples above. 

CRITICAL FORMATTING RULES:
- NO markdown formatting (##, *, -, etc.)
- NO headers or titles
- NO bullet points or lists  
- NO line breaks within the prompt
- Just plain text in paragraph format
- Start directly with the description

Write a natural, flowing description that matches the examples exactly in style, tone, and length.`;

  return context;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { shotId, formData } = req.body;

    // Validate required fields
    if (!shotId || !formData) {
      return res.status(400).json({ error: 'Shot ID and form data are required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured. Please set GEMINI_API_KEY environment variable.' });
    }

    // Get all shots for character consistency analysis
    const allShots = getShots();
    const currentShot = allShots.find(shot => shot.id === shotId);
    
    if (!currentShot) {
      return res.status(404).json({ error: 'Shot not found' });
    }

    // Analyze character consistency
    const selectedCharacters = formData.characters || [];
    const characterConsistency = analyzeCharacterConsistency(allShots, selectedCharacters);

    // Build the prompt context with project-wide context
    const promptContext = buildPromptContext(formData, characterConsistency, currentShot, allShots);

    // Generate prompt using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent(promptContext);
    const response = await result.response;
    const generatedPrompt = response.text();

    if (!generatedPrompt) {
      return res.status(500).json({ error: 'Failed to generate prompt' });
    }

    // Update the shot with the generated prompt
    const success = updateShot(shotId, { 
      prompt: generatedPrompt,
      status: 'prompt generated'
    });

    if (!success) {
      return res.status(500).json({ error: 'Failed to save generated prompt' });
    }

    // Return the updated shot data
    const updatedShots = getShots();
    const updatedShot = updatedShots.find(shot => shot.id === shotId);

    res.status(200).json({
      prompt: generatedPrompt,
      shot: updatedShot,
      allShots: updatedShots
    });

  } catch (error) {
    console.error('Error generating prompt:', error);
    res.status(500).json({ error: 'Failed to generate prompt' });
  }
} 