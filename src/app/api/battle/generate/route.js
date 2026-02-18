import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
    try {
        const { source, difficulty } = await req.json();
        const targetDifficulty = difficulty || 'Medium';
        
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an Elite Algorithm Architect specializing in official LeetCode challenge replication. You provide exact problem metadata including high-fidelity tags, acceptance rates, and language boilerplates."
                },
                {
                    role: "user",
                    content: `
                        ${source === 'leetcode' ? `Fetch an exact official LeetCode ${targetDifficulty.toUpperCase()} challenge. Return the exact official metadata.` : `Generate a unique creative DSA challenge in LeetCode style with ${targetDifficulty} difficulty.`}
                        
                        Return ONLY a JSON object with this exact structure:
                        {
                            "id": "1",
                            "title": "Exact Title",
                            "difficulty": "Easy/Medium/Hard",
                            "acceptanceRate": "57.2%",
                            "description": "Full official description",
                            "examples": [
                                { "input": "...", "output": "...", "explanation": "..." }
                            ],
                            "constraints": ["Constraint 1", "Constraint 2"],
                            "followUp": "Complexity requirement or extra challenge",
                            "topics": ["Array", "Hash Table"],
                            "companies": ["Google", "Amazon"],
                            "hints": ["Hint 1 text", "Hint 2 text"],
                            "editorial": {
                                "approach": "Comprehensive algorithmic strategies (e.g., Approach 1: Brute Force, Approach 2: Optimal) with clear steps and newlines",
                                "dryRun": "Line-by-line trace for the optimal C++ solution using an example",
                                "complexity": "Detailed O(N) notation for all approaches provided",
                                "solution": "Full working C++ code (Optimized) for the editorial. MUST BE VALID C++. DO NOT USE PYTHON."
                            },
                            "boilerplates": {
                                "cpp": "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};",
                                "python": "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        ",
                                "javascript": "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};",
                                "java": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}"
                            }
                        }
                    `
                }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const question = JSON.parse(completion.choices[0]?.message?.content || "{}");
        return NextResponse.json(question);
    } catch (error) {
        console.error("Groq Battle Generator Error:", error);
        return NextResponse.json({
            id: "1",
            title: "Two Sum",
            difficulty: "Easy",
            acceptanceRate: "57.0%",
            description: "Given an array of integers `nums` and an integer `target`, return *indices of the two numbers such that they add up to target*.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the *same* element twice.",
            examples: [
                { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." }
            ],
            constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9", "Only one valid answer exists."],
            followUp: "Can you come up with an algorithm that is less than O(n^2) time complexity?",
            topics: ["Array", "Hash Table"],
            hints: ["A really brute force way would be to search for all possible pairs of numbers but that would be slow.", "Is there a way we can use extra space to speed up the search?"],
            boilerplates: {
                cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};",
                python: "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        ",
                javascript: "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};",
                java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}"
            }
        });
    }
}

export async function GET() {
    return POST({ json: () => Promise.resolve({ source: 'ai' }) });
}
