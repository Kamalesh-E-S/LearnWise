import os
from groq import Groq
from typing import Dict, Any
from dotenv import load_dotenv


class RoadmapLLMService:
    def __init__(self):
        """Initialize Groq client with API key from environment"""
        load_dotenv()  # Load environment variables from .env
        api_key = os.getenv("GROQ_API_KEY")        
        if not api_key:
            raise ValueError("GROQ_API_KEY environment variable is required")
        self.client = Groq(api_key=api_key)

    async def generate_roadmap_content(self, skill: str, timeframe: str, current_knowledge: str, target_level: str) -> Dict[Any, Any]:
        """
        Generate personalized roadmap content using Groq LLM
        """
        prompt = f"""
I need a personalized roadmap for learning {skill} within {timeframe}. 
My current knowledge level is {current_knowledge}, and I'd like to reach a {target_level} level of proficiency.

Please create a hierarchical learning path with:
- hashes [varname] nodename
- Single hash (#) for {skill}
- Double hash (##) for time periods (day/week/month divisions)
- Triple hash (###) for specific learning topics
- Quadruple hash (####) for optional subtopics where needed

EXAMPLE --FOLLOW THIS FORMAT STRICTLY MAXIMUM DOUBLE HASH MUST BE 6 AND TRY AVOIDING QUADRUPLE HASHES LESS -MAXIMUM 4:

# [root] js
## [a1] Week 1
### [a11] JavaScript Refresher  
#### [a111] Variables and Data Types

NOTE: 
1.total number of quadruple hashes should be 4 or less. use it when the subtopic is actually required.
2.total number of double hashes should be 6 or less.
3.keep the node names short and concise.
4.Please ensure the roadmap is comprehensive yet realistic and simple for my {timeframe} and builds logically from my current knowledge level to my desired proficiency.
5.Do not include any introductory text, explanatory notes, headers, or concluding remarks in your response.
6.DOUBLE CHECK IF THE ROADMAP IS OF PROPER SYNTAX
"""


        try:
            # Generate content using Llama 3 70b
            response = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert learning path designer. Generate the output EXACTLY in the specified format, customized for the given skill."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model="llama3-70b-8192",
                temperature=0.7,
                max_tokens=2048
            )
            content = response.choices[0].message.content
 
            # Split sections based on '---'
            sections = content.strip().split('---')

            # Extract mermaid section only
            mermaid_section = sections[0].strip() if len(sections) > 0 else ''

            return {
                "success": True,
                "data": {
                    "mermaid": mermaid_section.strip(),
                    "descriptions": ""  # Empty string since we'll populate this later
                }
            }

        except Exception as e:
            print(f"Error generating roadmap content: {str(e)}")
            # Return default content in case of error
            return {
                "success": False,
                "error": f"Failed to generate roadmap content: {str(e)}"
            }

# Create singleton instance
llm_service = RoadmapLLMService() 