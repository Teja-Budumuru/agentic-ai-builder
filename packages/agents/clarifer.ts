import { LLM } from "../model/llm";
import { prisma } from "../model/db/client";
import { ClarificationResponse } from "../model/types";
import { Prisma } from "../model/db/generated/prisma/client";

const SYSTEM_PROMPT = `You are a game design consultant helping clarify a game idea before it gets built.

Your job is to analyze the user's game idea and determine what information is missing or ambiguous.

RULES:
1. Ask 2-5 highly targeted questions — never more.
2. Focus on what's needed to BUILD the game: mechanics, controls, win/lose conditions, visual style, difficulty.
3. Don't ask about technical implementation (the builder will decide that).
4. Don't ask obvious questions that can be inferred from the prompt.
5. If the idea is already clear enough, set isSufficient to true.

You MUST respond with valid JSON matching this exact structure:
{
  "questions": ["question 1", "question 2", ...],
  "isSufficient": false,
  "summary": "A clear summary of what we know so far about the game requirements",
  "confidence": 0.0 to 1.0
}

Set confidence based on:
- 0.0-0.3: Very vague, many unknowns
- 0.4-0.6: Some details but key mechanics unclear
- 0.7-0.8: Most details clear, a few minor gaps
- 0.9-1.0: Fully clear, ready to plan

When isSufficient is true, the "questions" array should still contain any final minor clarifications, and the "summary" should be a comprehensive requirements document.`;

const FOLLOWUP_PROMPT = `The user has answered your previous questions. Analyze their responses along with the original game idea.

If requirements are now sufficiently clear (confidence ≥ 0.8), set isSufficient to true and write a comprehensive summary of ALL requirements.

If still unclear, ask 1-3 more targeted follow-up questions.

Respond with the same JSON format:
{
  "questions": [...],
  "isSufficient": true/false,
  "summary": "comprehensive requirements summary",
  "confidence": 0.0 to 1.0
}
  
DONT IRRITATE THE USER BY ASKING TOO MANY QUESTIONS`;

// export interface ClariferOutput{
//     questions?: string[];
//     isSufficient: boolean;
//     summary: string;
//     confidence: number;
// }

export class ClarifierAgent {
    private llm: LLM;
    private sessionId: string

    constructor(llm: LLM, sessionId: string) {
        this.llm = llm;
        this.sessionId = sessionId;
    }

    async clarify(gameIdea: string, conversationHistory: ClarificationResponse | undefined = undefined): Promise<ClarificationResponse> {
        let historyPrompt = "";
        if (conversationHistory) {
            historyPrompt = `
            PREVIOUS SUMMARY: ${conversationHistory.summary}
            OPEN QUESTIONS: ${conversationHistory.questions.join(", ")}
            USER ANSWER: ${gameIdea}
            `;
        }
        const prompt = historyPrompt ? historyPrompt + FOLLOWUP_PROMPT :
            `Game idea: ${gameIdea}\n Analyze the game idea and ask questions to clarify the requirements.\n`

        const response = await this.llm.generate<ClarificationResponse>({
            prompt: prompt,
            system: SYSTEM_PROMPT,
            mode: "PLAN",
            sessionId: this.sessionId,
            json: true
        })

        if (response) {
            await prisma.session.update({
                where: {
                    id: this.sessionId
                },
                data: {
                    status: 'CLARIFYING',
                    clarification: response as unknown as Prisma.InputJsonObject,
                }
            })
            if (response.isSufficient) {
                await prisma.session.update({
                    where: {
                        id: this.sessionId
                    },
                    data: {
                        status: 'PLANNING',
                    }
                })
            }
        }
        return response as ClarificationResponse;


    }
}