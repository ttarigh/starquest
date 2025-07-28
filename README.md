# StarQuest Shot List

A shot management and prompt generation tool for external partners. This application allows you to manage your shot list and generate AI prompts using Google's Gemini API.

## Features

- **Shot Management**: Add, edit, and delete shots with titles, characters, and descriptions
- **CSV Import/Export**: Import your existing shot data or export for backup
- **AI Prompt Generation**: Generate detailed prompts using Gemini AI
- **Easy Reskinning**: Customize the appearance using the theme configuration
- **Local Storage**: All data is stored locally in JSON files

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your Gemini API key:**
   - Create a `.env.local` file in the root directory
   - Add your API key: `GEMINI_API_KEY=your_api_key_here`
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

5. **Start with your own data:**
   - The application starts completely empty
   - Add your own shots or import your CSV data
   - All data is stored locally in your `data/` directory

## Usage

### Managing Shots
- **Add Shots**: Click "Add New Shot" and fill in the details
- **Edit Shots**: Click "Generate Prompt" to create or edit prompts
- **Delete Shots**: Click the trash icon next to any shot
- **Filter Shots**: Use the status filters to view specific shot types

### CSV Operations
- **Import**: Click "Import CSV" and paste your CSV data
- **Export**: Click "Export CSV" to download all shot data
- **Format**: CSV should have columns: SHOT TITLE, ID, CHARACTER, DESCRIPTION, PROMPT, CAPTION, REFERENCE IMAGE, LINK TO VIDEO

### Generating Prompts
1. Click "Generate Prompt" on any shot
2. Fill out the form with:
   - Shot style (wide shot, close-up, etc.)
   - Setting/location (dance studio, competition stage, etc.)
   - Characters (brunette girl, group of dancers, etc.)
   - Costume/wardrobe (sparkly costume, rhinestone earrings, etc.)
   - Emotional tone (confident, nervous, excited, etc.)
   - Additional details
3. Click "Generate Prompt" to create an AI-generated prompt
4. Copy the prompt to your clipboard

## Customization

### Theme Configuration
Edit `config/theme.js` to customize colors, typography, and styling:

```javascript
export const theme = {
  colors: {
    primary: '#000000',        // Main brand color
    secondary: '#6B7280',      // Secondary color
    accent: '#10B981',         // Accent color
    // ... more options
  }
};
```

### Adding Custom Fields
To add custom fields to shots, modify:
- `lib/localStorage.js` - Update CSV import/export functions
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
├── SETUP.md                # Detailed setup guide
└── README.md               # This file
```

## Data Storage

- All shot data is stored locally in `data/shots.json`
- The `data/` directory is created automatically when you first add data
- The application starts completely empty - no sample data is included
- Make regular backups by exporting to CSV
- No cloud storage or external dependencies

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Troubleshooting

### Common Issues

**API Key Not Working**
- Verify your `GEMINI_API_KEY` is set in `.env.local`
- Check that the API key is valid at [Google AI Studio](https://makersuite.google.com/app/apikey)

**CSV Import Fails**
- Ensure your CSV has the correct column headers
- Check that the CSV format matches the expected structure
- Try exporting a sample CSV first to see the expected format

**Data Not Saving**
- Check that the `data/` directory exists and is writable
- Verify file permissions in your project directory

## Support

For detailed setup instructions and troubleshooting, see `SETUP.md`.

## License

This project is provided for external partner use. Please refer to your partnership agreement for usage terms.
