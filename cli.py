import os
from edumentor import EduMentorAI
from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel

console = Console()

def display_welcome():
    welcome_text = """
    # 🎓 Welcome to EduMentor AI!
    
    Your personalized learning assistant that helps you master any topic.
    
    Type 'exit' at any time to quit.
    """
    console.print(Markdown(welcome_text))

def display_results(results):
    # Display Assessment
    console.print(Panel(f"""
    📊 Your Level: {results['assessment']['level']}
    🎯 Learning Style: {results['assessment']['style']}
    """, title="Assessment Results"))

    # Display Resources
    console.print("\n🔍 Curated Resources:")
    for resource in results['resources']:
        console.print(f"- {resource['title']}")
        console.print(f"  Summary: {resource['summary']}")
        console.print(f"  Link: {resource['url']}\n")

    # Display Explanation
    console.print(Panel(results['explanation'], title="🧠 Explanation"))

    # Display Quiz
    console.print("\n🧪 Quiz:")
    for i, question in enumerate(results['quiz'], 1):
        console.print(f"\nQuestion {i}: {question['question']}")
        for j, option in enumerate(question['options'], 1):
            console.print(f"{j}. {option}")

def main():
    mentor = EduMentorAI()
    display_welcome()

    while True:
        topic = console.input("\n📚 What would you like to learn about? ")
        
        if topic.lower() == 'exit':
            console.print("\nThank you for learning with EduMentor AI! 👋")
            break

        with console.status("[bold green]Processing your request..."):
            try:
                results = mentor.learn_topic(topic)
                display_results(results)
            except Exception as e:
                console.print(f"[red]An error occurred: {str(e)}")

        console.print("\nWould you like to:")
        console.print("1. Learn another topic")
        console.print("2. Exit")
        
        choice = console.input("\nYour choice (1/2): ")
        if choice == "2":
            console.print("\nThank you for learning with EduMentor AI! 👋")
            break

if __name__ == "__main__":
    main() 