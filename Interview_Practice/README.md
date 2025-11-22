# Interview Practice Partner 🎯

An AI-powered mock interview platform built with React and Vite that helps job seekers practice and improve their interview skills through interactive conversations, real-time feedback, and comprehensive performance analysis.

## 🚀 Features

### Core Functionality
- **Role-based Interviews**: Select from 24+ job roles including Software Engineer, Data Scientist, Product Manager, etc.
- **Experience Level Matching**: Tailored questions based on your experience (Fresher to 5+ years)
- **Difficulty Levels**: Easy, Medium, Hard, and Expert question sets
- **Resume Integration**: Upload PDF resume or build one using the integrated resume builder
- **Voice Recognition**: Speak your answers naturally using Web Speech API
- **Real-time Feedback**: Instant analysis of communication, confidence, and technical skills

### Advanced Features
- **AI Interviewer Avatar**: Interactive holographic interviewer with speech synthesis
- **Performance Analytics**: Comprehensive scoring with radar charts and breakdowns
- **Speech Analysis**: Filler word detection, pace analysis, and clarity scoring
- **PDF Report Generation**: Download detailed interview reports
- **Progress Tracking**: Visual progress indicators throughout the interview process

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS with custom animations
- **Routing**: React Router DOM v6
- **Charts**: Chart.js with React Chart.js 2
- **PDF Processing**: PDF.js for resume parsing
- **PDF Generation**: jsPDF for report creation
- **Speech**: Web Speech API for voice recognition and synthesis
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/VarunKumar310/Interview_prac.git
   cd Interview_prac
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🎮 Usage

### Getting Started
1. **Login or Continue as Guest**: Start your interview journey
2. **Select Job Role**: Choose from 24+ available roles
3. **Set Experience Level**: Match questions to your expertise
4. **Choose Difficulty**: Select appropriate challenge level
5. **Upload Resume**: PDF upload or use the built-in resume builder

### During the Interview
- **Voice Input**: Click the microphone to speak your answers
- **Text Input**: Type responses if voice isn't available
- **Real-time Feedback**: See your progress and scores update live
- **Interactive AI**: Engage with the holographic interviewer avatar

### After the Interview
- **Performance Review**: Detailed analytics and scoring
- **Download Report**: PDF summary of your interview performance
- **Practice Again**: Reset and try different scenarios

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── InterviewerAvatar.jsx
│   ├── Timer.jsx
│   ├── ProgressBar.jsx
│   └── ...
├── pages/              # Main application pages
│   ├── Login.jsx
│   ├── RoleSelector.jsx
│   ├── ChatWindow.jsx
│   └── ...
├── utils/              # Utility functions and context
│   ├── InterviewContext.jsx
│   ├── audio.js
│   └── speech.js
├── styles/             # CSS and styling
└── assets/             # Static assets
```

## 🎨 Key Components

### InterviewContext
Centralized state management for:
- User selections (role, experience, difficulty)
- Resume data and chat history
- Performance scores and feedback
- Interview session management

### Speech & Audio Utils
- Text-to-speech for AI responses
- Speech recognition for user input
- Audio feedback and sound effects
- Speech analysis and filler word detection

### Performance Analytics
- Real-time scoring algorithms
- Communication and confidence metrics
- Technical skill assessment
- Comprehensive report generation

## 🔧 Configuration

### Environment Setup
The project uses Vite with custom configuration for PDF.js worker handling:

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["pdfjs-dist"], // Prevents Vite worker conflicts
  },
  // ... other configurations
});
```

### Browser Compatibility
- **Speech Recognition**: Chrome/Edge (WebKit Speech API)
- **Text-to-Speech**: All modern browsers
- **PDF Processing**: All modern browsers
- **Responsive Design**: Mobile and desktop optimized

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with modern React ecosystem
- Inspired by the need for accessible interview preparation
- Powered by Web APIs for speech and audio processing

## 📞 Support

For questions, suggestions, or issues, please open an issue on GitHub or contact the maintainer.

---

**Happy Interviewing! 🎯** Build confidence, improve skills, and land your dream job with AI-powered practice sessions.