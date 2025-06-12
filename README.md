# 🎓 Leembo.AI

A personalized learning assistant powered by CrewAI and Tavily that helps users master any topic through intelligent assessment, curated resources, and interactive learning.

## 🌟 Features

- 📊 Intelligent level assessment and learning style detection
- 🔍 Real-time resource curation using Tavily API
- 🧠 Personalized explanations based on user's level
- 🧪 Interactive quizzes to test understanding
- 📈 Progress tracking and adaptive learning
- 💻 Beautiful web interface with React and Chakra UI

## 🚀 Getting Started

### Prerequisites

- Python 3.8 or higher
- pip package manager
- Node.js 14 or higher
- npm package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
```

2. Install Python dependencies:

```bash
pip install -r requirements.txt
```

3. Set up environment variables:
   Create a `.env` file in the project root with:

```
TAVILY_API_KEY=your_tavily_api_key
OPENAI_API_KEY=your_openai_api_key
```

4. Install frontend dependencies:

```bash
cd frontend
npm install
```

### Usage

1. Start the backend API:

```bash
python api.py
```

2. In a new terminal, start the frontend development server:

```bash
cd frontend
npm install
npm start
```

3. Open your browser and navigate to `http://localhost:3000`
4. Enter a topic you want to learn about and follow the interactive learning process:

   - Complete the level assessment
   - Review curated resources
   - Read personalized explanations
   - Take quizzes to test your understanding

### CLI Interface

If you prefer a command-line interface, you can also run:

```bash
python cli.py
```

## 🛠️ Architecture

The system uses four specialized agents:

1. **Level Assessor Agent**: Determines user's knowledge level and learning style
2. **Tavily Curator Agent**: Searches for and curates relevant learning resources
3. **Explainer Agent**: Provides personalized explanations
4. **Quiz Generator Agent**: Creates level-appropriate quizzes

## 🙏 Acknowledgments

- [CrewAI](https://github.com/joaomdmoura/crewAI)
- [Tavily API](https://tavily.com/)
- [React](https://reactjs.org/)
- [Chakra UI](https://chakra-ui.com/)
- [Rich](https://github.com/Textualize/rich)
