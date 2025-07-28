const fs = require('fs');
const path = require('path');

const dataDir = path.join(process.cwd(), 'data');
const shotsFile = path.join(dataDir, 'shots.json');

// Ensure data directory exists
const ensureDataDir = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Read shots from local file
const getShots = () => {
  try {
    ensureDataDir();
    
    if (!fs.existsSync(shotsFile)) {
      return [];
    }
    
    const data = fs.readFileSync(shotsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading from local storage:', error);
    return [];
  }
};

// Save shots to local file
const saveShots = (shots) => {
  try {
    ensureDataDir();
    fs.writeFileSync(shotsFile, JSON.stringify(shots, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving to local storage:', error);
    return false;
  }
};

// Update a single shot
const updateShot = (shotId, updates) => {
  try {
    const shots = getShots();
    const updatedShots = shots.map(shot => 
      shot.id === shotId ? { ...shot, ...updates } : shot
    );
    return saveShots(updatedShots);
  } catch (error) {
    console.error('Error updating shot:', error);
    return false;
  }
};

// Add a new shot
const addShot = (newShot) => {
  try {
    const shots = getShots();
    const updatedShots = [...shots, newShot];
    return saveShots(updatedShots);
  } catch (error) {
    console.error('Error adding shot:', error);
    return false;
  }
};

// Delete a shot
const deleteShot = (shotId) => {
  try {
    const shots = getShots();
    const updatedShots = shots.filter(shot => shot.id !== shotId);
    return saveShots(updatedShots);
  } catch (error) {
    console.error('Error deleting shot:', error);
    return false;
  }
};

// Map status from CSV to our system
const mapStatus = (status) => {
  if (!status) return 'prompt not yet generated';
  
  const statusLower = status.toLowerCase().trim();
  
  // Map various status formats to our system
  if (statusLower.includes('prompt generated') || 
      statusLower.includes('generated') ||
      statusLower.includes('ready')) {
    return 'prompt generated';
  }
  
  if (statusLower.includes('selected') || 
      statusLower.includes('shot selected')) {
    return 'shot selected';
  }
  
  return 'prompt not yet generated';
};

// Import shots from CSV
const importFromCSV = (csvData) => {
  try {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    const shots = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Parse CSV line with proper handling of quoted fields
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      if (values.length >= headers.length) {
        const shot = {};
        headers.forEach((header, index) => {
          shot[header.toLowerCase().replace(/\s+/g, '_')] = values[index] || '';
        });
        
        // Map CSV columns to our shot structure
        const mappedShot = {
          id: shot.id || shot.shot_id || `shot_${i}`,
          title: shot.shot_title || shot.title || '',
          character: shot.character || '',
          description: shot.description || '',
          prompt: shot.prompt || '',
          caption: shot.caption || '',
          videoUrl: shot.link_to_video || shot.video_url || ''
        };
        
        // Determine status based on content, not just CSV status column
        if (mappedShot.prompt && mappedShot.prompt.trim()) {
          // If there's a prompt, check if it should be "shot selected" or "prompt generated"
          const csvStatus = mapStatus(shot.status);
          mappedShot.status = csvStatus === 'shot selected' ? 'shot selected' : 'prompt generated';
        } else {
          // No prompt, use the mapped status
          mappedShot.status = mapStatus(shot.status);
        }
        
        if (mappedShot.title) {
          shots.push(mappedShot);
        }
      }
    }
    
    return saveShots(shots);
  } catch (error) {
    console.error('Error importing CSV:', error);
    return false;
  }
};

// Export shots to CSV
const exportToCSV = () => {
  try {
    const shots = getShots();
    const headers = ['SHOT TITLE', 'ID', 'CHARACTER', 'DESCRIPTION', 'PROMPT', 'CAPTION', 'REFERENCE IMAGE', 'LINK TO VIDEO', 'STATUS'];
    
    const csvLines = [headers.join(',')];
    
    shots.forEach(shot => {
      const row = [
        `"${shot.title || ''}"`,
        shot.id || '',
        shot.character || '',
        `"${shot.description || ''}"`,
        `"${shot.prompt || ''}"`,
        `"${shot.caption || ''}"`,
        '', // Reference image (empty for now)
        shot.videoUrl || '',
        shot.status || 'prompt not yet generated'
      ];
      csvLines.push(row.join(','));
    });
    
    return csvLines.join('\n');
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return null;
  }
};

module.exports = {
  getShots,
  saveShots,
  updateShot,
  addShot,
  deleteShot,
  importFromCSV,
  exportToCSV
}; 