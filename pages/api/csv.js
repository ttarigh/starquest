const { importFromCSV, exportToCSV } = require('../../lib/localStorage');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Import CSV
    try {
      const { csvData } = req.body;
      
      if (!csvData) {
        return res.status(400).json({ error: 'CSV data is required' });
      }
      
      const success = importFromCSV(csvData);
      
      if (success) {
        res.status(200).json({ message: 'CSV imported successfully' });
      } else {
        res.status(500).json({ error: 'Failed to import CSV' });
      }
    } catch (error) {
      console.error('Error importing CSV:', error);
      res.status(500).json({ error: 'Failed to import CSV' });
    }
  } else if (req.method === 'GET') {
    // Export CSV
    try {
      const csvData = exportToCSV();
      
      if (csvData) {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="shots-export.csv"');
        res.status(200).send(csvData);
      } else {
        res.status(500).json({ error: 'Failed to export CSV' });
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      res.status(500).json({ error: 'Failed to export CSV' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Allow larger CSV files
    },
  },
}; 