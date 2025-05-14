import os
import json
from typing import List, Dict
from crewai import Agent, Task, Crew, Process
from tavily import TavilyClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class EduMentorAI:
    def __init__(self):
        self.tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
        self.setup_agents()

    def setup_agents(self):
        # Level Assessor Agent
        self.level_assessor = Agent(
            role="Level Assessor",
            goal="Determine user's knowledge level and learning style preferences",
            backstory="""You are an expert in educational assessment and learning style analysis. 
            Your job is to quickly gauge a learner's current knowledge level and preferred learning method.
            Always return your assessment as a JSON string in the format: 
            {"level": "Beginner/Intermediate/Advanced", "style": "Visual/Auditory/Reading/Kinesthetic"}""",
            allow_delegation=False
        )

        # Tavily Curator Agent
        self.curator = Agent(
            role="Resource Curator",
            goal="Find and curate the best learning resources using Tavily",
            backstory="""You are a master curator of educational content. Using Tavily's search capabilities,
            you find the most relevant and high-quality learning materials tailored to the user's level.
            Always return your curated resources as a JSON string containing an array of resources in the format:
            [{"title": "Resource Title", "url": "Resource URL", "summary": "Brief summary"}]""",
            allow_delegation=False
        )

        # Explainer Agent
        self.explainer = Agent(
            role="Concept Explainer",
            goal="Break down complex topics into understandable explanations",
            backstory="""You are an expert teacher who can explain any concept clearly and effectively.
            You adapt your explanations based on the learner's level and preferred learning style.
            Return your explanation as a clear, markdown-formatted text.""",
            allow_delegation=False
        )

        # Quiz Generator Agent
        self.quiz_generator = Agent(
            role="Quiz Master",
            goal="Create engaging and level-appropriate quizzes",
            backstory="""You are a skilled assessment creator who designs quizzes that test understanding
            while maintaining engagement. Your questions adapt to the user's knowledge level.
            Always return your quiz as a JSON string containing an array of questions in the format:
            [{"question": "Question text", "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "correct_answer": 0}]""",
            allow_delegation=False
        )

    def parse_json_response(self, response: str) -> Dict:
        """Parse JSON from the agent's response, handling potential text before/after the JSON."""
        try:
            # Try to parse the entire response as JSON first
            return json.loads(response)
        except json.JSONDecodeError:
            # If that fails, try to find JSON within the response
            try:
                # Find the first { and last }
                start = response.find('{')
                end = response.rfind('}') + 1
                if start != -1 and end != 0:
                    json_str = response[start:end]
                    return json.loads(json_str)
                # If no object found, try array
                start = response.find('[')
                end = response.rfind(']') + 1
                if start != -1 and end != 0:
                    json_str = response[start:end]
                    return json.loads(json_str)
            except (json.JSONDecodeError, ValueError):
                # If JSON parsing fails, create a default structure
                return {"error": "Failed to parse response", "raw_response": response}

    def assess_level(self, topic: str) -> Dict:
        """Assess user's knowledge level and learning style for a given topic."""
        task = Task(
            description=f"Assess the user's knowledge level and learning style for: {topic}. Return the result as a JSON string.",
            agent=self.level_assessor,
            expected_output="""A JSON string in the format:
            {
                "level": "Beginner/Intermediate/Advanced",
                "style": "Visual/Auditory/Reading/Kinesthetic"
            }"""
        )
        
        crew = Crew(
            agents=[self.level_assessor],
            tasks=[task],
            process=Process.sequential
        )
        
        result = crew.kickoff()
        # Get the last task result as that's our assessment
        return self.parse_json_response(str(result))

    def curate_resources(self, topic: str, level: str, style: str) -> List[Dict]:
        """Search for and curate learning resources using Tavily."""
        search_results = self.tavily_client.search(
            query=f"{topic} {level} level learning resources {style}",
            search_depth="advanced"
        )
        
        task = Task(
            description=f"Curate and summarize the following resources for {level} level learners who prefer {style} learning. Return the result as a JSON string:\n{search_results}",
            agent=self.curator,
            expected_output="""A JSON string containing an array of resources:
            [
                {
                    "title": "Resource Title",
                    "url": "Resource URL",
                    "summary": "Brief summary"
                }
            ]"""
        )
        
        crew = Crew(
            agents=[self.curator],
            tasks=[task],
            process=Process.sequential
        )
        
        result = crew.kickoff()
        return self.parse_json_response(str(result))

    def explain_topic(self, topic: str, level: str, style: str) -> str:
        """Generate an explanation tailored to user's level and style."""
        task = Task(
            description=f"Explain {topic} for a {level} level learner who prefers {style} learning. Use markdown formatting.",
            agent=self.explainer,
            expected_output="A markdown-formatted explanation of the topic"
        )
        
        crew = Crew(
            agents=[self.explainer],
            tasks=[task],
            process=Process.sequential
        )
        
        result = crew.kickoff()
        return str(result)  # Return the explanation as is since it's just text

    def generate_quiz(self, topic: str, level: str) -> List[Dict]:
        """Generate a quiz based on the topic and user's level."""
        task = Task(
            description=f"Create a quiz about {topic} appropriate for {level} level learners. Return the result as a JSON string.",
            agent=self.quiz_generator,
            expected_output="""A JSON string containing an array of questions:
            [
                {
                    "question": "Quiz question",
                    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                    "correct_answer": 0
                }
            ]"""
        )
        
        crew = Crew(
            agents=[self.quiz_generator],
            tasks=[task],
            process=Process.sequential
        )
        
        result = crew.kickoff()
        return self.parse_json_response(str(result))

    def learn_topic(self, topic: str):
        """Main learning flow for a topic."""
        try:
            # 1. Assess level and learning style
            assessment = self.assess_level(topic)
            if "error" in assessment:
                print(f"Warning: Assessment parsing failed. Using defaults. Error: {assessment['raw_response']}")
                assessment = {"level": "Beginner", "style": "Visual"}
                
            level = assessment.get('level', 'Beginner')
            style = assessment.get('style', 'Visual')

            # 2. Curate resources
            resources = self.curate_resources(topic, level, style)
            if isinstance(resources, dict) and "error" in resources:
                print(f"Warning: Resource curation failed. Error: {resources['raw_response']}")
                resources = []

            # 3. Generate initial explanation
            explanation = self.explain_topic(topic, level, style)

            # 4. Create quiz
            quiz = self.generate_quiz(topic, level)
            if isinstance(quiz, dict) and "error" in quiz:
                print(f"Warning: Quiz generation failed. Error: {quiz['raw_response']}")
                quiz = []

            return {
                'assessment': assessment,
                'resources': resources,
                'explanation': explanation,
                'quiz': quiz
            }
            
        except Exception as e:
            print(f"Error in learn_topic: {str(e)}")
            # Return a default structure if something goes wrong
            return {
                'assessment': {"level": "Beginner", "style": "Visual"},
                'resources': [],
                'explanation': "Sorry, I encountered an error while preparing your learning materials.",
                'quiz': []
            }

if __name__ == "__main__":
    mentor = EduMentorAI()
    # Example usage
    result = mentor.learn_topic("Python programming basics")
    print(result) 