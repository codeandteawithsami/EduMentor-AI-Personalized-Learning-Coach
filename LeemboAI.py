import os
import json
from typing import List, Dict
from crewai import Agent, Task, Crew, Process
from tavily import TavilyClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class LeemboAI:
    def __init__(self):
        self.tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
        self.setup_agents()
        self.current_session = {}
        self.pending_assessment = None

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

        # Trend Analyzer Agent (New)
        self.trend_analyzer = Agent(
            role="Trending Topics Analyzer",
            goal="Discover and curate the most relevant trending educational topics",
            backstory="""You are an expert in identifying trending topics across technology, science, humanities,
            and other educational domains. Using Tavily's search capabilities, you find current hot topics that
            people are eager to learn about. You focus on educational relevance and filter out purely news events
            unless they have significant learning potential.
            Always return your analysis as a JSON string containing an array of trending topics in the format:
            [{"topic": "Topic Title", "category": "Technology/Science/Humanities/etc", "relevance_score": 0-10}]""",
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
            # First try to parse the entire response as JSON
            return json.loads(response)
        except json.JSONDecodeError:
            # If that fails, try to find JSON within the response
            try:
                # Look for JSON array pattern
                if '[' in response and ']' in response:
                    start = response.find('[')
                    end = response.rfind(']') + 1
                    json_str = response[start:end]
                    return json.loads(json_str)
                
                # Look for JSON object pattern
                elif '{' in response and '}' in response:
                    start = response.find('{')
                    end = response.rfind('}') + 1
                    json_str = response[start:end]
                    return json.loads(json_str)
                
                # If no valid JSON structure found
                return {"error": "No valid JSON structure found", "raw_response": response}
            
            except (json.JSONDecodeError, ValueError) as e:
                # If JSON parsing fails, return error with details
                return {
                    "error": f"Failed to parse response: {str(e)}", 
                    "raw_response": response
                }

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

    def get_trending_topics(self, limit: int = 5, user_age: str = None, user_preferences: list = None) -> List[Dict]:
        """Get current trending educational topics using Tavily and LLM, personalized for the user."""
        try:
            # If user has preferences, prioritize them in the search
            preference_context = ""
            age_context = ""
            
            if user_preferences and len(user_preferences) > 0:
                top_preferences = user_preferences  # Use top 3 preferences for search context
                preference_context = f"related to {', '.join(top_preferences)}"
            
            if user_age:
                age = int(user_age) if isinstance(user_age, str) else user_age
                if age < 13:
                    age_context = "for elementary school students"
                elif age < 18:
                    age_context = "for teenagers and high school students"
                # No modifier needed for adults
            
            # First, use Tavily to search for trending educational topics
            search_query = "trending educational topics in technology, science, and humanities of today"
            
            # If we have user preferences, modify the search to prioritize them
            if preference_context or age_context:
                search_query = f"trending educational topics {preference_context} {age_context}"
            
            search_results = self.tavily_client.search(
                query=search_query,
                search_depth="advanced"
            )
            
            # Then, use the trend analyzer agent to process and curate the results
            task = Task(
                description=f"""Analyze these search results and identify the top trending educational topics:
                {search_results}
                
                Consider topics from various domains such as technology, science, humanities, arts, and business also for children learning .
                Focus on topics with educational value that people would want to learn about.
                
                {f"Prioritize topics related to the user's interests: {', '.join(user_preferences)}" if user_preferences and len(user_preferences) > 0 else ""}
                {f"Ensure topics are appropriate for {age_context}" if age_context else ""}
                
                Rank topics by their relevance and trendiness.
                
                Return ONLY a JSON array with the top {limit} trending topics for learning:
                [
                    {{
                        "topic": "Full topic name as a learning subject",
                        "category": "Technology/Science/Business/Humanities/Arts/Health/Other",
                        "relevance_score": (1-10 integer),
                        "preference_match": (boolean indicating if this relates to user preferences)
                    }}
                ]""",
                agent=self.trend_analyzer,
                expected_output=f"A JSON array of {limit} trending educational topics"
            )
            
            crew = Crew(
                agents=[self.trend_analyzer],
                tasks=[task],
                process=Process.sequential
            )
            
            result = crew.kickoff()
            parsed_result = self.parse_json_response(str(result))
            
            # Ensure we got a valid list of topics
            if isinstance(parsed_result, list):
                # If we have user preferences, boost topics that match preferences
                if user_preferences and len(user_preferences) > 0:
                    # Check each topic for relevance to preferences
                    for topic in parsed_result:
                        topic_name = topic.get('topic', '').lower()
                        preference_match = False
                        
                        # Check if any user preference is related to this topic
                        for pref in user_preferences:
                            pref_lower = pref.lower()
                            if pref_lower in topic_name or topic_name in pref_lower or any(word in topic_name for word in pref_lower.split()):
                                preference_match = True
                                # Boost the relevance score for preference matches
                                topic['relevance_score'] = min(10, topic.get('relevance_score', 5) + 3)
                                topic['preference_match'] = True
                                break
                        
                        if not preference_match:
                            topic['preference_match'] = False
                
                # Sort by relevance score (descending) and limit to requested number
                topics = sorted(parsed_result, key=lambda x: x.get('relevance_score', 0), reverse=True)[:limit]
                
                # If we have user preferences but no matches in top results, ensure at least one preference is included
                if user_preferences and len(user_preferences) > 0 and not any(topic.get('preference_match', False) for topic in topics) and len(topics) > 0:
                    # Replace the last topic with a topic based on user preference
                    pref_topic = {
                        "topic": f"Latest developments in {user_preferences[0]}",
                        "category": "User Interest",
                        "relevance_score": 8,
                        "preference_match": True
                    }
                    topics[-1] = pref_topic
                
                # Format the topics for return - just return the topic names for simplicity
                formatted_topics = [topic['topic'] for topic in topics]
                return formatted_topics
            
            # Fallback topics if parsing fails - try to include user preferences if available
            fallback_topics = [
                "Latest developments in artificial intelligence",
                "Climate change mitigation strategies",
                "Quantum computing advancements",
                "Space exploration breakthroughs",
                "Biotechnology and genetic engineering",
                "Blockchain applications beyond cryptocurrency",
                "Sustainable energy technologies",
                "Cybersecurity best practices"
            ]
            
            # If we have user preferences, replace some fallback topics with preference-based topics
            if user_preferences and len(user_preferences) > 0:
                preference_topics = [f"Recent advances in {pref}" for pref in user_preferences[:3]]
                # Replace some of the fallback topics with preference-based ones
                for i, pref_topic in enumerate(preference_topics):
                    if i < len(fallback_topics):
                        fallback_topics[i] = pref_topic
            
            return fallback_topics[:limit]
        
        except Exception as e:
            print(f"Error in get_trending_topics: {str(e)}")
            # If error occurs, return basic fallback topics
            return [
                "Latest developments in technology",
                "Scientific discoveries of the year",
                "Historical events that shaped today",
                "Mathematical concepts explained simply",
                "Understanding world economics"
            ][:limit]
        
    def get_recommended_courses(self, user_preferences=None, current_topic="", limit=4):
            """Get recommended video courses based on user preferences and current topic.
            
            Args:
                user_preferences: List of user's learning interests/preferences
                current_topic: Current topic the user is exploring
                limit: Maximum number of courses to return
                
            Returns:
                List of course objects with details including title, platform, instructor, etc.
            """
            try:
                # Create a search query based on preferences and current topic
                search_query = "best video courses tutorials"
                
                if current_topic:
                    search_query = f"best {current_topic} video courses tutorials"
                elif user_preferences and len(user_preferences) > 0:
                    # Use first 2 preferences if no current topic
                    top_preferences = user_preferences
                    search_query = f"best {' '.join(top_preferences)} video courses tutorials"
                
                # Use Tavily to search for courses
                search_results = self.tavily_client.search(
                    query=search_query,
                    search_depth="advanced",
                    include_domains=["youtube.com", "udemy.com", "coursera.org", "edx.org", "skillshare.com"]
                )
                
                # Use the curator agent to process and format the results
                task = Task(
                    description=f"""Analyze these search results and identify the best video courses:
                    {search_results}
                    
                    {"Focus on courses related to: " + current_topic if current_topic else ""}
                    {"Also consider the user's interests: " + ", ".join(user_preferences) if user_preferences and len(user_preferences) > 0 else ""}
                    
                    Extract course information and return a JSON array with {limit} recommended video courses.
                    For each course, include:
                    - id: A unique identifier (string or number)
                    - title: The course title
                    - platform: Platform name (YouTube, Udemy, Coursera, etc.)
                    - instructor: Name of instructor or organization
                    - duration: Course duration (e.g., "2 hours", "8 weeks")
                    - rating: A rating from 1.0 to 5.0
                    - thumbnail: URL to course thumbnail image (use a placeholder if unavailable)
                    - url: Direct URL to the course
                    - tags: Array of relevant topic tags (3-5 tags)
                    
                    IMPORTANT: Return ONLY a valid JSON array, no additional text.
                    """,
                    agent=self.curator,
                    expected_output=f"A JSON array of {limit} recommended video courses"
                )
                
                crew = Crew(
                    agents=[self.curator],
                    tasks=[task],
                    process=Process.sequential
                )
                
                result = crew.kickoff()
                parsed_result = self.parse_json_response(str(result))
                
                # Ensure we got valid course data
                if isinstance(parsed_result, list) and len(parsed_result) > 0:
                    # Validate and clean up course data
                    valid_courses = []
                    for course in parsed_result[:limit]:
                        # Ensure all required fields exist
                        if all(key in course for key in ['id', 'title', 'platform', 'url']):
                            # Set defaults for any missing fields
                            course_with_defaults = {
                                'id': course.get('id', str(len(valid_courses) + 1)),
                                'title': course.get('title', 'Untitled Course'),
                                'platform': course.get('platform', 'Online'),
                                'instructor': course.get('instructor', 'Unknown'),
                                'duration': course.get('duration', 'Varies'),
                                'rating': self._safe_float(course.get('rating'), default=4.5),
                                'thumbnail': course.get('thumbnail', '/api/placeholder/400/225'),
                                'url': course.get('url', ''),
                                'tags': course.get('tags', ['Learning'])
                            }
                            valid_courses.append(course_with_defaults)
                    
                    return valid_courses
                
                # Fallback data if parsing fails
                return self._get_fallback_courses(current_topic, user_preferences, limit)
                
            except Exception as e:
                print(f"Error in get_recommended_courses: {str(e)}")
                return self._get_fallback_courses(current_topic, user_preferences, limit)
            
    def _safe_float(self, value, default=0.0):
        try:
            return float(value)
        except (TypeError, ValueError):
            return default
    def _get_fallback_courses(self, topic=None, preferences=None, limit=4):
        """Generate fallback course recommendations if API calls fail."""
        fallback_courses = [
            {
                "id": "1",
                "title": "Complete Machine Learning & Data Science Bootcamp",
                "platform": "YouTube",
                "instructor": "freeCodeCamp.org",
                "duration": "11 hours",
                "rating": 4.8,
                "thumbnail": "https://i.ytimg.com/vi/cBBTWcHkVVY/hqdefault.jpg",
                "url": "https://www.youtube.com/watch?v=cBBTWcHkVVY",
                "tags": ["Machine Learning", "Data Science", "Python"]
            },
            {
                "id": "2",
                "title": "JavaScript Crash Course for Beginners",
                "platform": "YouTube",
                "instructor": "Traversy Media",
                "duration": "1.5 hours",
                "rating": 4.9,
                "thumbnail": "https://i.ytimg.com/vi/hdI2bqOjy3c/hqdefault.jpg",
                "url": "https://www.youtube.com/watch?v=hdI2bqOjy3c",
                "tags": ["JavaScript", "Web Development", "Programming"]
            },
            {
                "id": "3",
                "title": "Modern React with Redux",
                "platform": "Udemy",
                "instructor": "Stephen Grider",
                "duration": "52 hours",
                "rating": 4.7,
                "thumbnail": "/api/placeholder/400/220",
                "url": "https://www.udemy.com/course/react-redux/",
                "tags": ["React", "Redux", "Web Development"]
            },
            {
                "id": "4",
                "title": "Python for Everybody",
                "platform": "Coursera",
                "instructor": "University of Michigan",
                "duration": "8 weeks",
                "rating": 4.8,
                "thumbnail": "/api/placeholder/400/220",
                "url": "https://www.coursera.org/specializations/python",
                "tags": ["Python", "Programming", "Computer Science"]
            },
            {
                "id": "5",
                "title": "The Web Developer Bootcamp",
                "platform": "Udemy",
                "instructor": "Colt Steele",
                "duration": "63 hours",
                "rating": 4.7,
                "thumbnail": "/api/placeholder/400/220",
                "url": "https://www.udemy.com/course/the-web-developer-bootcamp/",
                "tags": ["Web Development", "HTML", "CSS", "JavaScript"]
            },
            {
                "id": "6",
                "title": "Introduction to Quantum Computing",
                "platform": "edX",
                "instructor": "MIT",
                "duration": "6 weeks",
                "rating": 4.6,
                "thumbnail": "/api/placeholder/400/220",
                "url": "https://www.edx.org/course/quantum-computing",
                "tags": ["Quantum Computing", "Physics", "Computer Science"]
            },
            {
                "id": "7",
                "title": "Complete Digital Marketing Course",
                "platform": "YouTube",
                "instructor": "SimpliLearn",
                "duration": "8 hours",
                "rating": 4.5,
                "thumbnail": "/api/placeholder/400/220",
                "url": "https://www.youtube.com/watch?v=hD-SXLYgRZ0",
                "tags": ["Digital Marketing", "SEO", "Social Media"]
            },
            {
                "id": "8",
                "title": "Introduction to Artificial Intelligence",
                "platform": "Coursera",
                "instructor": "Stanford University",
                "duration": "11 weeks",
                "rating": 4.8,
                "thumbnail": "/api/placeholder/400/220",
                "url": "https://www.coursera.org/learn/introduction-to-ai",
                "tags": ["AI", "Machine Learning", "Computer Science"]
            }
        ]
        
        # If topic is provided, prioritize courses related to that topic
        if topic:
            topic_lower = topic.lower()
            prioritized_courses = [
                course for course in fallback_courses 
                if topic_lower in course["title"].lower() or 
                any(topic_lower in tag.lower() for tag in course["tags"])
            ]
            
            # If we found relevant courses, return them
            if prioritized_courses:
                return prioritized_courses[:limit]
        
        # If preferences are provided, prioritize courses related to preferences
        if preferences and len(preferences) > 0:
            for pref in preferences:
                pref_lower = pref.lower()
                prioritized_courses = [
                    course for course in fallback_courses 
                    if pref_lower in course["title"].lower() or 
                    any(pref_lower in tag.lower() for tag in course["tags"])
                ]
                
                # If we found relevant courses, return them
                if prioritized_courses:
                    return prioritized_courses[:limit]
        
        # If no specific matches, return the first 'limit' courses
        return fallback_courses[:limit]
    def curate_resources(self, topic: str, level: str, style: str) -> List[Dict]:
        """Search for and curate learning resources using Tavily."""
        max_retries = 3
        for attempt in range(max_retries):
            search_results = self.tavily_client.search(
                query=f"{topic} {level} level learning resources {style}",
                search_depth="advanced"
            )
            
            task = Task(
                description=f"""Curate and summarize these resources for {level} level learners who prefer {style} learning:
                {search_results}
                
                Return ONLY the JSON array with no additional text.
                Format:
                [
                    {{
                        "title": "Resource Title",
                        "url": "Resource URL",
                        "summary": "Brief summary"
                    }}
                ]""",
                agent=self.curator,
                expected_output="A JSON array of curated resources"
            )
            
            crew = Crew(
                agents=[self.curator],
                tasks=[task],
                process=Process.sequential
            )
            
            result = crew.kickoff()
            parsed_result = self.parse_json_response(str(result))
            
            # Validate the resources structure
            if isinstance(parsed_result, list) and len(parsed_result) > 0:
                valid_resources = all(
                    isinstance(r, dict) and
                    "title" in r and
                    "url" in r and
                    "summary" in r
                    for r in parsed_result
                )
                if valid_resources:
                    return parsed_result
            
            print(f"Resource curation attempt {attempt + 1} failed, retrying...")
        
        # If all retries failed, return an empty list
        return []

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
        max_retries = 3
        for attempt in range(max_retries):
            task = Task(
                description=f"""Create a quiz about {topic} appropriate for {level} level learners.
                Generate exactly 5 multiple-choice questions.
                Each question must have exactly 4 options.
                Return ONLY the JSON array with no additional text.
                Format:
                [
                    {{
                        "question": "Question text",
                        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                        "correct_answer": 0
                    }}
                ]""",
                agent=self.quiz_generator,
                expected_output="A JSON array of 5 quiz questions"
            )
            
            crew = Crew(
                agents=[self.quiz_generator],
                tasks=[task],
                process=Process.sequential
            )
            
            result = crew.kickoff()
            parsed_result = self.parse_json_response(str(result))
            
            # Validate the quiz structure
            if isinstance(parsed_result, list) and len(parsed_result) > 0:
                # Verify each question has the required structure
                valid_quiz = all(
                    isinstance(q, dict) and
                    "question" in q and
                    "options" in q and
                    "correct_answer" in q and
                    isinstance(q["options"], list) and
                    len(q["options"]) == 4
                    for q in parsed_result
                )
                if valid_quiz:
                    return parsed_result
            
            print(f"Quiz generation attempt {attempt + 1} failed, retrying...")
        
        # If all retries failed, return a default quiz
        return [
            {
                "question": f"Basic question about {topic}?",
                "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                "correct_answer": 0
            }
        ]

    def reset_session(self):
        """Reset the current learning session."""
        self.current_session = {}

    def get_initial_assessment(self, topic: str):
        """Get initial assessment for user approval."""
        try:
            assessment = self.assess_level(topic)
            if "error" in assessment:
                assessment = {"level": "Beginner", "style": "Visual"}
            
            self.pending_assessment = {
                'topic': topic,
                'assessment': assessment
            }
            return self.pending_assessment
        except Exception as e:
            print(f"Error in get_initial_assessment: {str(e)}")
            return {
                'topic': topic,
                'assessment': {"level": "Beginner", "style": "Visual"}
            }

    def continue_with_assessment(self, topic: str, approved_assessment: dict):
        """Continue the learning process with the approved assessment."""
        try:
            # Store the current topic and assessment
            self.current_session['topic'] = topic
            self.current_session['assessment'] = approved_assessment
            
            level = approved_assessment.get('level', 'Beginner')
            style = approved_assessment.get('style', 'Visual')

            # 2. Curate resources
            resources = self.curate_resources(topic, level, style)
            self.current_session['resources'] = resources

            # 3. Generate initial explanation
            explanation = self.explain_topic(topic, level, style)
            self.current_session['explanation'] = explanation

            # 4. Create quiz
            quiz = self.generate_quiz(topic, level)
            self.current_session['quiz'] = quiz

            # Clear pending assessment
            self.pending_assessment = None

            # Return the complete learning package
            return {
                'topic': topic,
                'assessment': approved_assessment,
                'resources': resources,
                'explanation': explanation,
                'quiz': quiz
            }
            
        except Exception as e:
            print(f"Error in continue_with_assessment: {str(e)}")
            return {
                'topic': topic,
                'assessment': approved_assessment,
                'resources': [],
                'explanation': "Sorry, I encountered an error while preparing your learning materials.",
                'quiz': []
            }

    def get_current_session(self) -> dict:
        """Get the current learning session data."""
        return self.current_session

if __name__ == "__main__":
    mentor = LeemboAI()
    # Example usage
    result = mentor.get_trending_topics()
    print(result)