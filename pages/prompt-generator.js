import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { cssVariables } from '../config/theme';

// Starter chips for different categories
const starterChips = {
  shotStyle: [
    'wide shot',
    'close-up',
    'medium shot',
    'overhead shot',
    'tracking shot',
    'reality TV style',
    'documentary style',
    'cinematic'
  ],
  setting: [
    'dance studio',
    'competition stage',
    'backstage',
    'bright stage lighting',
    'costume rack background',
    'mirror backdrop',
    'black backdrop',
    'silver stars backdrop'
  ],
  characters: [
    'brunette girl',
    'asian girl',
    'black dancer',
    'blonde dancer',
    'redhead dancer',
    'teen dancer',
    'junior dancer',
    'group of 5-8 dancers',
    'ages 9-11'
  ],
  costume: [
    'sparkly costume',
    'sequin outfit',
    'matching costumes',
    'pink and orange',
    'light blue',
    'rhinestone earrings',
    'hair bow',
    'stage makeup',
    'competition attire'
  ],
  emotion: [
    'confident',
    'nervous',
    'excited',
    'focused',
    'emotional',
    'determined',
    'stressed',
    'proud',
    'anxious',
    'joyful'
  ]
};

const ChipInput = ({ label, chips, selectedChips, onChipsChange, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  const addChip = (chipText) => {
    if (chipText.trim() && !selectedChips.includes(chipText.trim())) {
      onChipsChange([...selectedChips, chipText.trim()]);
    }
    setInputValue('');
  };

  const removeChip = (chipToRemove) => {
    onChipsChange(selectedChips.filter(chip => chip !== chipToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addChip(inputValue);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold uppercase tracking-wider">{label}</label>
      
      {/* Selected Chips */}
      <div className="flex flex-wrap gap-1 mb-2">
        {selectedChips.map((chip, index) => (
          <span
            key={index}
            className="inline-flex items-center bg-black text-white text-xs px-2 py-1 rounded"
          >
            {chip}
            <button
              onClick={() => removeChip(chip)}
              className="ml-2 text-white hover:text-gray-300"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="w-full text-xs border border-gray-300 px-3 py-2 focus:outline-none focus:border-black"
        />
      </div>

      {/* Quick Add Chips */}
      <div className="flex flex-wrap gap-1">
        {chips.filter(chip => !selectedChips.includes(chip)).slice(0, 6).map((chip, index) => (
          <button
            key={index}
            onClick={() => addChip(chip)}
            className="text-xs border border-gray-300 px-2 py-1 hover:border-black transition-colors"
          >
            + {chip}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function PromptGenerator() {
  const router = useRouter();
  const { shotId, mode } = router.query;

  const [shot, setShot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [editingPrompt, setEditingPrompt] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [formData, setFormData] = useState({
    shotStyle: [],
    setting: [],
    characters: [],
    costume: [],
    emotion: [],
    additionalDetails: ''
  });

  useEffect(() => {
    if (shotId) {
      fetchShot();
    }
  }, [shotId]);

  const fetchShot = async () => {
    try {
      const response = await fetch('/api/shots');
      if (response.ok) {
        const shots = await response.json();
        const currentShot = shots.find(s => s.id === shotId);
        if (currentShot) {
          setShot(currentShot);
          if (mode === 'edit' && currentShot.prompt) {
            setGeneratedPrompt(currentShot.prompt);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching shot:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePrompt = async () => {
    if (!shot) return;

    setGenerating(true);
    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shotId: shot.id,
          formData
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setGeneratedPrompt(result.prompt);
        
        // Update the shot in the list
        if (result.allShots) {
          // You could update a global state here if needed
        }
      } else {
        const error = await response.json();
        alert(`Error generating prompt: ${error.error}`);
      }
    } catch (error) {
      console.error('Error generating prompt:', error);
      alert('Error generating prompt. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const savePrompt = async (prompt) => {
    if (!shot) return;

    try {
      const response = await fetch('/api/shots', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shotId: shot.id,
          updates: { prompt }
        }),
      });

      if (response.ok) {
        setGeneratedPrompt(prompt);
        setEditingPrompt(false);
        setPromptText('');
      } else {
        console.error('Failed to save prompt');
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black font-mono flex items-center justify-center" style={{ fontFamily: 'Space Mono, monospace' }}>
        <div className="text-center">
          <div className="text-xl mb-2">LOADING...</div>
          <div className="text-xs text-gray-600">Fetching shot details</div>
        </div>
      </div>
    );
  }

  if (!shot) {
    return (
      <div className="min-h-screen bg-white text-black font-mono flex items-center justify-center" style={{ fontFamily: 'Space Mono, monospace' }}>
        <div className="text-center">
          <div className="text-xl mb-2">SHOT NOT FOUND</div>
          <Link href="/">
            <button className="text-xs border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors">
              ← BACK TO LIST
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-mono" style={{ fontFamily: 'Space Mono, monospace' }}>
      <style jsx global>{`
        ${cssVariables}
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
      `}</style>
      
      <Head>
        <title>{mode === 'edit' ? 'Edit Prompt' : 'Prompt Generator'} - {shot.title}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="border-b border-black pb-4 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold mb-2">
              {mode === 'edit' ? 'EDIT PROMPT' : 'PROMPT GENERATOR'}
            </h1>
            <p className="text-sm text-gray-600">{shot.title}</p>
            {shot.description && (
              <p className="text-xs text-gray-500 mt-1">{shot.description}</p>
            )}
            {mode === 'edit' && (
              <p className="text-xs text-gray-600 mt-1">✏️ Editing existing prompt</p>
            )}
          </div>
          <Link href="/">
            <button className="text-xs border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors">
              ← BACK TO LIST
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            <ChipInput
              label="Shot Style"
              chips={starterChips.shotStyle}
              selectedChips={formData.shotStyle}
              onChipsChange={(chips) => updateFormData('shotStyle', chips)}
              placeholder="Add shot style..."
            />

            <ChipInput
              label="Setting"
              chips={starterChips.setting}
              selectedChips={formData.setting}
              onChipsChange={(chips) => updateFormData('setting', chips)}
              placeholder="Add setting..."
            />

            <ChipInput
              label="Character"
              chips={starterChips.characters}
              selectedChips={formData.characters}
              onChipsChange={(chips) => updateFormData('characters', chips)}
              placeholder="Add character details..."
            />

            <ChipInput
              label="Wardrobe & Appearance"
              chips={starterChips.costume}
              selectedChips={formData.costume}
              onChipsChange={(chips) => updateFormData('costume', chips)}
              placeholder="Add wardrobe details..."
            />

            <ChipInput
              label="Emotional Tone"
              chips={starterChips.emotion}
              selectedChips={formData.emotion}
              onChipsChange={(chips) => updateFormData('emotion', chips)}
              placeholder="Add emotional tone..."
            />

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider">Additional Details</label>
              <textarea
                value={formData.additionalDetails}
                onChange={(e) => updateFormData('additionalDetails', e.target.value)}
                placeholder="Describe specific actions, movements, emotions..."
                rows={4}
                className="w-full text-xs border border-gray-300 px-3 py-2 focus:outline-none focus:border-black resize-none"
              />
            </div>

            <button
              onClick={generatePrompt}
              disabled={generating}
              className="w-full bg-black text-white py-3 text-xs font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {generating ? 'GENERATING...' : (mode === 'edit' ? 'REGENERATE PROMPT' : 'GENERATE PROMPT')}
            </button>
          </div>

          {/* Generated Prompt */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider">Generated Prompt</h3>
            
            {generatedPrompt ? (
              <div className="space-y-4">
                <div className="border border-gray-300 p-4 bg-gray-50">
                  {editingPrompt ? (
                    <textarea
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      className="w-full text-xs bg-gray-50 border border-gray-300 p-4 focus:outline-none resize-none leading-relaxed"
                      rows={Math.max(4, generatedPrompt.split('\n').length)}
                      placeholder="Edit prompt..."
                      onBlur={() => {
                        if (promptText.trim() !== generatedPrompt) {
                          savePrompt(promptText.trim());
                        }
                        setEditingPrompt(false);
                        setPromptText('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          e.target.blur();
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <div 
                      onClick={() => {
                        setEditingPrompt(true);
                        setPromptText(generatedPrompt);
                      }}
                      className="text-xs leading-relaxed cursor-text hover:bg-gray-100 transition-colors p-1 -m-1 rounded"
                    >
                      {generatedPrompt}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedPrompt)}
                    className="flex-1 bg-black text-white py-2 text-xs font-bold hover:bg-gray-800 transition-colors"
                  >
                    COPY TO CLIPBOARD
                  </button>
                  <button
                    onClick={() => setGeneratedPrompt('')}
                    className="px-4 border border-gray-300 text-xs text-gray-600 hover:border-black hover:text-black transition-colors"
                  >
                    CLEAR
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-gray-300 p-8 text-center text-gray-400">
                <p className="text-xs">Fill out the form and click "Generate Prompt" to create your AI video prompt</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 