import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { cssVariables } from '../config/theme';

const statusOptions = [
  'prompt not yet generated',
  'prompt generated',
  'shot selected'
];

const getStatusColor = (status) => {
  switch (status) {
    case 'prompt not yet generated': return 'text-gray-400';
    case 'prompt generated': return 'text-black';
    case 'shot selected': return 'text-green-600 font-bold';
    default: return 'text-gray-400';
  }
};

export default function Home() {
  const [shots, setShots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState([]);
  const [showPrompt, setShowPrompt] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImportArea, setShowImportArea] = useState(false);
  const [editingVideoLink, setEditingVideoLink] = useState(null);
  const [videoLink, setVideoLink] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [editingCaption, setEditingCaption] = useState(null);
  const [newShotForm, setNewShotForm] = useState({
    title: '',
    character: '',
    description: ''
  });
  const [isAddingShot, setIsAddingShot] = useState(false);

  // Button renderer for shot actions
  const getButtonContent = (shot) => {
    switch (shot.status) {
      case 'shot selected':
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setEditingVideoLink(shot.id);
                setVideoLink(shot.videoUrl || '');
              }}
              className="text-xs border border-green-600 text-green-600 px-2 py-1 hover:bg-green-600 hover:text-white transition-colors"
              title={shot.videoUrl ? 'Edit video link' : 'Add video link'}
            >
              {shot.videoUrl ? 'EDIT VIDEO' : 'ADD VIDEO'}
            </button>
            <Link href={`/prompt-generator?shotId=${shot.id}&mode=edit`}>
              <button className="text-xs border border-black px-2 py-1 hover:bg-black hover:text-white transition-colors">
                EDIT PROMPT
              </button>
            </Link>
          </div>
        );
      case 'prompt generated':
        return (
          <div className="flex space-x-2">
            <Link href={`/prompt-generator?shotId=${shot.id}&mode=edit`}>
              <button className="text-xs border border-black px-2 py-1 hover:bg-black hover:text-white transition-colors">
                EDIT PROMPT
              </button>
            </Link>
            <button
              onClick={() => updateShotStatus(shot.id, 'shot selected')}
              className="text-xs border border-green-600 text-green-600 px-2 py-1 hover:bg-green-600 hover:text-white transition-colors"
            >
              SELECT SHOT
            </button>
          </div>
        );
      case 'prompt not yet generated':
      default:
        return (
          <Link href={`/prompt-generator?shotId=${shot.id}`}>
            <button className="text-xs border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors">
              GENERATE PROMPT
            </button>
          </Link>
        );
    }
  };

  // Fetch shots from API on component mount
  useEffect(() => {
    fetchShots();
  }, []);

  const fetchShots = async () => {
    try {
      const response = await fetch('/api/shots');
      if (response.ok) {
        const data = await response.json();
        setShots(data);
      } else {
        console.error('Failed to fetch shots');
      }
    } catch (error) {
      console.error('Error fetching shots:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateShotStatus = async (shotId, newStatus) => {
    try {
      const response = await fetch('/api/shots', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shotId,
          updates: { status: newStatus }
        }),
      });

      if (response.ok) {
        const updatedShots = await response.json();
        setShots(updatedShots);
      } else {
        console.error('Failed to update shot status');
      }
    } catch (error) {
      console.error('Error updating shot status:', error);
    }
  };

  const saveVideoLink = async (shotId) => {
    try {
      const response = await fetch('/api/shots', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shotId,
          updates: { videoUrl: videoLink }
        }),
      });

      if (response.ok) {
        const updatedShots = await response.json();
        setShots(updatedShots);
        setEditingVideoLink(null);
        setVideoLink('');
      } else {
        console.error('Failed to save video link');
      }
    } catch (error) {
      console.error('Error saving video link:', error);
    }
  };

  const addNewShot = async () => {
    if (!newShotForm.title.trim()) {
      alert('Please enter a title for the shot');
      return;
    }

    setIsAddingShot(true);
    try {
      const newShot = {
        id: `shot_${Date.now()}`,
        title: newShotForm.title,
        character: newShotForm.character,
        description: newShotForm.description,
        prompt: '',
        status: 'prompt not yet generated'
      };

      const response = await fetch('/api/shots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newShot),
      });

      if (response.ok) {
        const updatedShots = await response.json();
        setShots(updatedShots);
        setShowAddForm(false);
        setNewShotForm({ title: '', character: '', description: '' });
      } else {
        console.error('Failed to add shot');
      }
    } catch (error) {
      console.error('Error adding shot:', error);
    } finally {
      setIsAddingShot(false);
    }
  };

  const deleteShot = async (shotId, shotTitle) => {
    if (!confirm(`Are you sure you want to delete "${shotTitle}"?`)) {
      return;
    }

    try {
      const response = await fetch('/api/shots', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shotId }),
      });

      if (response.ok) {
        const updatedShots = await response.json();
        setShots(updatedShots);
      } else {
        console.error('Failed to delete shot');
      }
    } catch (error) {
      console.error('Error deleting shot:', error);
    }
  };

  const saveCaption = async (shotId, caption) => {
    try {
      const response = await fetch('/api/shots', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shotId,
          updates: { caption }
        }),
      });

      if (response.ok) {
        const updatedShots = await response.json();
        setShots(updatedShots);
      } else {
        console.error('Failed to save caption');
      }
    } catch (error) {
      console.error('Error saving caption:', error);
    }
  };

  const getProgress = () => {
    const total = shots.length;
    const generated = shots.filter(shot => shot.status === 'prompt generated').length;
    const selected = shots.filter(shot => shot.status === 'shot selected').length;
    return { 
      total, 
      generated, 
      selected,
      percentage: total > 0 ? Math.round(((generated + selected) / total) * 100) : 0 
    };
  };

  const toggleFilter = (status) => {
    setActiveFilters(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const getFilteredShots = () => {
    if (activeFilters.length === 0) return shots;
    return shots.filter(shot => activeFilters.includes(shot.status));
  };

  const handleFileUpload = async (file) => {
    if (!file || file.type !== 'text/csv') {
      setImportStatus('Please select a valid CSV file');
      return;
    }

    try {
      const text = await file.text();
      const response = await fetch('/api/csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ csvData: text }),
      });

      if (response.ok) {
        setImportStatus('CSV imported successfully!');
        fetchShots();
        setTimeout(() => {
          setShowImportArea(false);
          setImportStatus('');
        }, 2000);
      } else {
        const error = await response.json();
        setImportStatus(`Import failed: ${error.error}`);
      }
    } catch (error) {
      setImportStatus('Import failed. Please check your CSV format.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleCsvExport = () => {
    window.open('/api/csv', '_blank');
  };

  const progress = getProgress();
  const filteredShots = getFilteredShots();

  return (
    <div className="min-h-screen bg-white font-mono" style={{ fontFamily: 'Space Mono, monospace' }}>
      <style jsx global>{`
        ${cssVariables}
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
      `}</style>
      
      <Head>
        <title>StarQuest Shot List</title>
        <meta name="description" content="Shot management and prompt generation tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="border-b border-black pb-4 mb-8">
          <h1 className="text-2xl font-bold mb-4">STARQUEST SHOT LIST</h1>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span>OVERALL PROGRESS</span>
              <span>{progress.percentage}% COMPLETE ({progress.selected} selected, {progress.generated} ready)</span>
            </div>
            <div className="w-full bg-gray-200 h-2">
              <div 
                className="bg-black h-2 transition-all duration-300" 
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center">
            <div>
              <label className="text-xs font-bold block mb-2">FILTER BY STATUS</label>
              <div className="flex space-x-1">
                {[
                  { status: 'prompt not yet generated', label: 'Not Started', count: shots.filter(s => s.status === 'prompt not yet generated').length },
                  { status: 'prompt generated', label: 'Prompt Ready', count: shots.filter(s => s.status === 'prompt generated').length },
                  { status: 'shot selected', label: 'Selected', count: shots.filter(s => s.status === 'shot selected').length }
                ].map(filter => (
                  <button
                    key={filter.status}
                    onClick={() => toggleFilter(filter.status)}
                    className={`text-xs px-2 py-1 border transition-colors ${
                      activeFilters.includes(filter.status)
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-300 hover:border-black'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>
              {activeFilters.length > 0 && (
                <button 
                  onClick={() => setActiveFilters([])}
                  className="text-xs text-gray-600 hover:text-black mt-1"
                >
                  Clear filters
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600">{filteredShots.length} shots displayed</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
          >
            {showAddForm ? '− CANCEL' : '+ ADD NEW SHOT'}
          </button>
          
          <button
            onClick={() => setShowImportArea(!showImportArea)}
            className="text-xs border border-gray-600 px-4 py-2 hover:border-black transition-colors"
          >
            {showImportArea ? '− CANCEL' : 'IMPORT CSV'}
          </button>
          
          <button
            onClick={handleCsvExport}
            className="text-xs border border-gray-600 px-4 py-2 hover:border-black transition-colors"
          >
            EXPORT CSV
          </button>
        </div>

        {/* Inline Add Shot Form */}
        {showAddForm && (
          <div className="border border-gray-300 p-4 mb-6 bg-gray-50">
            <h3 className="text-sm font-bold mb-3">ADD NEW SHOT</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1">TITLE *</label>
                <input
                  type="text"
                  value={newShotForm.title}
                  onChange={(e) => setNewShotForm({...newShotForm, title: e.target.value})}
                  placeholder="e.g., Solo Routine: Dramatic Turn"
                  className="w-full text-xs border border-gray-300 px-3 py-2 focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">CHARACTER</label>
                <input
                  type="text"
                  value={newShotForm.character}
                  onChange={(e) => setNewShotForm({...newShotForm, character: e.target.value})}
                  placeholder="e.g., Brunette, Asian Girl, etc."
                  className="w-full text-xs border border-gray-300 px-3 py-2 focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">DESCRIPTION</label>
                <input
                  type="text"
                  value={newShotForm.description}
                  onChange={(e) => setNewShotForm({...newShotForm, description: e.target.value})}
                  placeholder="Brief description..."
                  className="w-full text-xs border border-gray-300 px-3 py-2 focus:outline-none focus:border-black"
                />
              </div>
            </div>
            <div className="flex space-x-2 mt-3">
              <button
                onClick={addNewShot}
                disabled={isAddingShot}
                className="bg-black text-white py-2 px-4 text-xs font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isAddingShot ? 'ADDING...' : 'ADD SHOT'}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewShotForm({ title: '', character: '', description: '' });
                }}
                className="px-4 border border-gray-300 text-xs text-gray-600 hover:border-black hover:text-black transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        )}

        {/* Inline CSV Import Area */}
        {showImportArea && (
          <div className="border border-gray-300 p-4 mb-6 bg-gray-50">
            <h3 className="text-sm font-bold mb-3">IMPORT CSV</h3>
            <p className="text-xs text-gray-600 mb-3">
              Drag and drop a CSV file here, or click to browse. The CSV should have columns: SHOT TITLE, ID, CHARACTER, DESCRIPTION, PROMPT, CAPTION, REFERENCE IMAGE, LINK TO VIDEO, STATUS
            </p>
            
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed p-6 text-center transition-colors ${
                isDragOver 
                  ? 'border-black bg-gray-100' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <div className="text-gray-500">
                  <p className="text-sm mb-2">📁 Drag & drop CSV file here or click to browse</p>
                  <p className="text-xs text-gray-400">Supports .csv files only</p>
                </div>
              </label>
            </div>
            
            {importStatus && (
              <div className={`mt-3 p-2 text-xs ${
                importStatus.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {importStatus}
              </div>
            )}
          </div>
        )}

        {/* Shot List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="text-xl mb-2">LOADING...</div>
            <div className="text-xs text-gray-600">Fetching shot list</div>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredShots.map((shot, index) => (
              <div key={shot.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="grid grid-cols-12 gap-4 py-3 items-start">
                  {/* Shot Number & Title */}
                  <div className="col-span-5">
                    <div className="text-sm font-bold">
                      {String(index + 1).padStart(2, '0')}. {shot.title}
                    </div>
                    {shot.character && (
                      <div className="text-xs text-gray-600 mt-1">Character: {shot.character}</div>
                    )}
                    {shot.description && (
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">{shot.description}</div>
                    )}
                    {shot.prompt && (
                      <button 
                        onClick={() => setShowPrompt(showPrompt === shot.id ? null : shot.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 mt-1 underline"
                      >
                        {showPrompt === shot.id ? 'Hide Prompt' : 'View Prompt'}
                      </button>
                    )}
                    
                    {/* Video Link Display/Edit */}
                    {editingVideoLink === shot.id ? (
                      <div className="mt-2 flex items-center space-x-2">
                        <input
                          type="url"
                          value={videoLink}
                          onChange={(e) => setVideoLink(e.target.value)}
                          placeholder="https://drive.google.com/..."
                          className="flex-1 text-xs border border-gray-300 px-2 py-1 focus:outline-none focus:border-black"
                        />
                        <button
                          onClick={() => saveVideoLink(shot.id)}
                          className="text-xs bg-black text-white px-2 py-1 hover:bg-gray-800 transition-colors"
                        >
                          SAVE
                        </button>
                        <button
                          onClick={() => {
                            setEditingVideoLink(null);
                            setVideoLink('');
                          }}
                          className="text-xs border border-gray-300 px-2 py-1 hover:border-black transition-colors"
                        >
                          CANCEL
                        </button>
                      </div>
                    ) : (
                      shot.videoUrl && (
                        <div className="mt-1">
                          <a 
                            href={shot.videoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-green-600 hover:text-green-800 underline"
                          >
                            📹 View Video
                          </a>
                        </div>
                      )
                    )}
                    
                    {/* CC Caption Row */}
                    <div className="mt-2 max-w-xl">
                      <div className="flex items-center space-x-2">
                        <div className="bg-black text-white text-xs font-bold flex items-center justify-center px-3 py-1.5 self-start mt-1">CC</div>
                        <textarea
                          defaultValue={shot.caption || ''}
                          placeholder="Add caption..."
                          className="flex-1 text-xs border border-gray-400 px-2 py-1 focus:outline-none focus:border-black resize-none"
                          rows={1}
                          onFocus={(e) => {
                            e.target.rows = 3;
                            setEditingCaption(shot.id);
                          }}
                          onBlur={(e) => {
                            e.target.rows = 1;
                            setEditingCaption(null);
                            const newCap = e.target.value.trim();
                            if (newCap !== (shot.caption || '')) {
                              saveCaption(shot.id, newCap);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              e.target.blur();
                            }
                          }}
                        />
                      </div>
                      {editingCaption === shot.id && (
                        <p className="text-xs text-gray-400 mt-1 pl-12">Enter to save</p>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-3 flex items-start pt-1">
                    <select 
                      value={shot.status}
                      onChange={(e) => updateShotStatus(shot.id, e.target.value)}
                      className={`text-xs border border-gray-300 rounded px-2 py-1 bg-white ${getStatusColor(shot.status)} focus:outline-none focus:border-black`}
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="col-span-4 flex items-start justify-end pt-1 space-x-2">
                    <div className="flex-1 flex justify-end">
                      {getButtonContent(shot)}
                    </div>
                    <button
                      onClick={() => deleteShot(shot.id, shot.title)}
                      className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-1 py-1 rounded transition-colors"
                      title="Delete shot"
                    >
                      ×
                    </button>
                  </div>
                </div>
                
                {/* Expanded Prompt - Outside Grid */}
                {showPrompt === shot.id && shot.prompt && (
                  <div className="px-4 pb-3">
                    <div className="text-xs text-gray-700 p-2 bg-gray-100 border-l-2 border-gray-400 ml-0">
                      {shot.prompt}
                      <button 
                        className="ml-3 text-xs text-blue-600 hover:text-blue-800 underline"
                        onClick={() => {
                          navigator.clipboard.writeText(shot.prompt);
                          alert('Prompt copied to clipboard');
                        }}
                      >
                        copy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
