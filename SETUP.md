# StarQuest Shot List - Setup Guide

This is a shot management and prompt generation tool for external partners. It allows you to manage your shot list and generate AI prompts using Google's Gemini API.

## Features

- **Shot Management**: Add, edit, and delete shots
- **CSV Import/Export**: Import your existing shot data or export for backup
- **AI Prompt Generation**: Generate detailed prompts using Gemini AI
- **Easy Reskinning**: Customize the appearance using the theme configuration

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**To get a Gemini API key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and paste it in your `.env.local` file

### 3. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 4. Start with Your Own Data

The application starts completely empty. You can:
- Add shots manually using the "Add New Shot" button
- Import your existing CSV data using the "Import CSV" feature
- All data is stored locally in the `data/` directory

## Usage

### Adding Shots
1. Click "Add New Shot" on the main page
2. Fill in the title, character (optional), and description
3. Click "Add Shot"

### Importing CSV Data
1. Click "Import CSV" on the main page
2. Paste your CSV data in the format:
   ```
   SHOT TITLE,ID,CHARACTER,DESCRIPTION,PROMPT,CAPTION,REFERENCE IMAGE,LINK TO VIDEO
   "Shot Title",shot_id,Character Name,Description,Generated Prompt,Caption,,Video URL
   ```
3. Click "Import CSV"

### Generating Prompts
1. Click "Generate Prompt" on any shot
2. Fill out the form with shot style, setting, characters, costume, and emotional tone
3. Click "Generate Prompt" to create an AI-generated prompt
4. Copy the prompt to your clipboard

### Exporting Data
1. Click "Export CSV" to download all your shot data
2. The CSV file will include all shot information for backup or sharing

## Customization

### Reskinning the UI

To customize the appearance, edit the theme configuration in `config/theme.js`:

```javascript
export const theme = {
  colors: {
    primary: '#000000',        // Main brand color
    secondary: '#6B7280',      // Secondary color
    accent: '#10B981',         // Accent color
    background: '#FFFFFF',      // Background color
    // ... more color options
  },
  // ... other theme options
};
```

### Adding Custom Fields

To add custom fields to shots, modify the shot structure in:
- `lib/localStorage.js` - Update the CSV import/export functions
- `pages/index.js` - Add form fields to the "Add Shot" modal
- `pages/api/shots.js` - Update the default shot structure

## File Structure

```
starquest_github/
├── config/
│   └── theme.js              # Theme configuration
├── lib/
│   └── localStorage.js       # Local file storage
├── pages/
│   ├── api/
│   │   ├── csv.js           # CSV import/export
│   │   ├── generate-prompt.js # AI prompt generation
│   │   └── shots.js         # Shot CRUD operations
│   ├── index.js             # Main shot list page
│   └── prompt-generator.js  # Prompt generation form
├── data/                    # Local data storage (created automatically)
└── SETUP.md                # This file
```

## Troubleshooting

### API Key Issues
- Make sure your `GEMINI_API_KEY` is set in `.env.local`
- Verify the API key is valid at [Google AI Studio](https://makersuite.google.com/app/apikey)

### CSV Import Issues
- Ensure your CSV has the correct column headers
- Check that the CSV format matches the expected structure
- Try exporting a sample CSV first to see the expected format

### Data Storage
- Shot data is stored locally in `data/shots.json`
- Make regular backups by exporting to CSV
- The `data/` directory is created automatically

## Support

For issues or questions, please refer to the documentation or contact the development team. 