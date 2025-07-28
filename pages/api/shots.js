const { getShots, saveShots, updateShot, addShot, deleteShot } = require('../../lib/localStorage');

// Initialize with some sample shots if empty
const initialShots = [
  {
    id: 'shot_1',
    title: 'Opening Scene: Dance Studio Setup',
    character: 'Main Character',
    description: 'Wide establishing shot of the dance studio with mirrors and barres',
    prompt: '',
    caption: '',
    status: 'prompt not yet generated'
  },
  {
    id: 'shot_2', 
    title: 'Interview: Pre-Competition Nerves',
    character: 'Brunette Girl',
    description: 'Close-up talking head shot expressing nervousness about upcoming performance',
    prompt: '',
    caption: '',
    status: 'prompt not yet generated'
  }
];

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      let shots = getShots();
      
      // Initialize with sample data if empty
      if (shots.length === 0) {
        const success = saveShots(initialShots);
        if (success) {
          shots = initialShots;
        }
      }
      
      res.status(200).json(shots);
    } catch (error) {
      console.error('Error fetching shots:', error);
      res.status(500).json({ error: 'Failed to fetch shots' });
    }
  } else if (req.method === 'PUT') {
    // Update a shot
    const { shotId, updates } = req.body;
    
    // Validate required fields
    if (!shotId || !updates) {
      return res.status(400).json({ error: 'Shot ID and updates are required' });
    }
    
    try {
      const success = updateShot(shotId, updates);
      if (success) {
        const shots = getShots();
        res.status(200).json(shots);
      } else {
        res.status(500).json({ error: 'Failed to update shot' });
      }
    } catch (error) {
      console.error('Error updating shot:', error);
      res.status(500).json({ error: 'Failed to update shot' });
    }
  } else if (req.method === 'POST') {
    // Add a new shot
    const newShot = req.body;
    
    // Validate required fields
    if (!newShot.title || !newShot.id) {
      return res.status(400).json({ error: 'Title and ID are required' });
    }
    
    try {
      const success = addShot(newShot);
      if (success) {
        const shots = getShots();
        res.status(200).json(shots);
      } else {
        res.status(500).json({ error: 'Failed to add shot' });
      }
    } catch (error) {
      console.error('Error adding shot:', error);
      res.status(500).json({ error: 'Failed to add shot' });
    }
  } else if (req.method === 'DELETE') {
    // Delete a shot
    const { shotId } = req.body;
    
    // Validate required fields
    if (!shotId) {
      return res.status(400).json({ error: 'Shot ID is required' });
    }
    
    try {
      const success = deleteShot(shotId);
      if (success) {
        const shots = getShots();
        res.status(200).json(shots);
      } else {
        res.status(500).json({ error: 'Failed to delete shot' });
      }
    } catch (error) {
      console.error('Error deleting shot:', error);
      res.status(500).json({ error: 'Failed to delete shot' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'POST', 'DELETE']);
    res.status(405).json({ error: 'Method not allowed' });
  }
} 

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
}; 