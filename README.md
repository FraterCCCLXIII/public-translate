# Public:Translate 言語機

## Purpose & Vision

**Public:Translate** is an open-source voice translation and display tool designed to foster greater cross-cultural dialogue—especially around religion, philosophy, and the dharma. The concept was born from the author's own experience needing a translator while speaking with Japanese monks and priests in Japan. This app is designed to make such conversations accessible, even when a human translator is not present.

**Key Use Case:**
- Display and read live speech and its translation to an audience (e.g., in a classroom, temple, or public talk).
- Cast the app to a TV or use on any screen for group viewing.
- Support for both text display and text-to-speech playback.

## Features
- Live voice-to-text transcription and translation between 150+ languages.
- Auto-playback of translated text using speech synthesis.
- Responsive, accessible UI for use on desktop, mobile, or TV.
- Language-specific text alignment (LTR, RTL, CJK).
- Full transcript view and download (collated input/translation pairs).
- Settings for translation provider, TTS, and more.

## Known Bugs

- **Transcript Log Issues**: The transcript history functionality currently has issues with partial transcript duplication and missing translations. The system is being actively improved to better handle interim vs final speech recognition results and translation timing.

## Project Structure

```
public-translate/
├── src/
│   ├── components/         # React UI components (TranscriptNav, TranscriptPanel, etc.)
│   ├── hooks/              # Custom React hooks (e.g., useTranslation)
│   ├── pages/              # Main app entry (Index.tsx)
│   ├── lib/                # Utility functions (e.g., voice, language helpers)
│   ├── index.css           # Global styles
│   └── App.tsx             # App root
├── public/                 # Static assets
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite config
└── README.md               # This file
```

## Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/FraterCCCLXIII/public-translate.git
   cd public-translate
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Start the development server:**
   ```sh
   npm run dev
   ```
4. **Open in your browser:**
   Visit [http://localhost:8080](http://localhost:8080) (or the next available port).

## Usage
- Click the mic button to start/stop recording.
- Select source and target languages.
- The left panel shows your spoken language; the right panel shows the translation.
- Use the speaker icon to play back the transcript with text-to-speech.
- Open the full transcript modal to view or download the session transcript (input and translation collated).
- Cast your browser tab or window to a TV for group display.

## Contributing

Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a new branch for your feature or fix.
3. Make your changes with clear, descriptive commits.
4. Ensure code is linted and tested.
5. Open a pull request with a clear description of your changes.

**Guidelines:**
- Follow SOLID principles and keep code modular and maintainable.
- Prefer reusing and extending existing components.
- Ensure accessibility and responsive design.
- Use strong types (TypeScript), and add tests for core logic.

## Roadmap

- [ ] **Multi-speaker support:**
  - Attribute transcript lines to different speakers.
  - Visual separation and color-coding for speakers.
- [ ] **Improved speech synthesis:**
  - More natural, expressive TTS voices.
  - Custom voice selection and tuning.
- [ ] **Session saving and history:**
  - Save and load past session transcripts.
  - Export/import session data.
- [ ] **Better punctuation and formatting:**
  - Smarter sentence segmentation and punctuation restoration.
- [ ] **Mobile/TV optimizations:**
  - Enhanced UI for large screens and touch devices.

## License

MIT — see [LICENSE](LICENSE) for details.

---

**Public:Translate 言語機** — Bridging cultures, one conversation at a time.
