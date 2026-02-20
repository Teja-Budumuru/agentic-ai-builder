export interface ClarificationResponse {
    questions: string[];
    isSufficient: boolean;
    summary: string;
    confidence: number;
}

export interface PlanResponse {
    title: string;
    description: string;
    framework: "vanilla" | "phaser";
    mechanics: { name: string; description: string }[];
    controls: { input: string; action: string }[];
    systems: string[];
    assetDescriptions: string[];
    gameLoopDescription: string;
}

export interface CodeFile {
    filename: string;
    content: string;
    type: string;
}
export interface BuildResponse {
    files: CodeFile[];
    entryPoint: string;
}