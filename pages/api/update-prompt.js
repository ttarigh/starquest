import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { shotId, currentPrompt, feedback } = req.body;

  if (!shotId || !currentPrompt || !feedback) {
    return res.status(400).json({ error: 'Shot ID, current prompt, and feedback are required' });
  }

  try {
    // Fetch all shots to get character consistency context
    const shotsResponse = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/shots`);
    let allShots = [];
    if (shotsResponse.ok) {
      allShots = await shotsResponse.json();
    }

    // Extract existing prompts for character consistency
    const existingPrompts = allShots
      .filter(shot => shot.prompt && shot.id !== shotId)
      .map(shot => shot.prompt)
      .slice(0, 5); // Limit to last 5 for context

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const promptUpdateContext = `You are an expert video prompt engineer for "StarQuest," a Dance Moms-style reality TV show about competitive dance. You need to update a video generation prompt based on user feedback about the generated video.

CONTEXT: StarQuest is a high-energy reality TV show featuring young competitive dancers (ages 9-16), dramatic stage lighting, sequined costumes, and the intense atmosphere of dance competitions. The aesthetic should match the glossy, dramatic style of Dance Moms with professional competition staging.

CHARACTER CONSISTENCY: When characters are mentioned (like "brunette girl", "asian dancer"), maintain consistency with these existing character references from other shots:
${existingPrompts.length > 0 ? existingPrompts.map((prompt, i) => `${i + 1}. ${prompt}`).join('\n') : 'No existing character references available.'}

CURRENT PROMPT:
"${currentPrompt}"

USER FEEDBACK ABOUT THE GENERATED VIDEO:
"${feedback}"

TASK: Analyze the feedback and intelligently update the prompt to address the issues. Common feedback types:
- Lighting issues: "too dark" → add "bright stage lighting", "dramatic spotlight"
- Character issues: "doesn't match character" → strengthen character details, reference hair/costume colors
- Movement issues: "not enough action" → add specific dance moves, "energetic choreography"
- Setting issues: "wrong background" → specify "competition stage", "dance studio"
- Costume issues: "wrong outfit" → add specific sequin/color details

REQUIREMENTS:
1. Keep the prompt natural language, single paragraph, 2-4 sentences
2. NO markdown, headers, bullet points, or formatting
3. Address the specific feedback while maintaining the overall shot concept
4. Keep character consistency with existing references
5. Maintain StarQuest/Dance Moms aesthetic
6. Be specific about visual details but concise

Return ONLY the updated prompt, nothing else.`;

    const result = await model.generateContent(promptUpdateContext);
    const updatedPrompt = result.response.text().trim();

    // Save the updated prompt to the shot
    const updateResponse = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/shots`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shotId,
        updates: { 
          prompt: updatedPrompt,
          status: 'prompt updated'
        }
      }),
    });

    if (!updateResponse.ok) {
      throw new Error('Failed to save updated prompt');
    }

    return res.status(200).json({
      updatedPrompt,
      message: 'Prompt updated successfully based on feedback'
    });

  } catch (error) {
    console.error('Error updating prompt:', error);
    return res.status(500).json({ 
      error: 'Failed to update prompt',
      details: error.message 
    });
  }
} 