import "dotenv/config";
process.removeAllListeners('warning'); // Suppress all warnings
import { Controller } from "./packages/controller";
import { prisma } from "./packages/model/db/client";
import readline from "readline";
import { BuildResponse, ClarificationResponse, PlanResponse } from "./packages/model/types";
import path from "path";
import fs from "fs";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const question = (query: string) => {
    return new Promise((resolve) => {
        rl.question(query, resolve)
    })
}

async function main() {
    try {
        const name = await question(" WHAT IS YOUR NAME?")
        const user = await prisma.user.create({
            data:
            {
                name: name as string,
                email: `${name}CLI${new Date().getTime()}@gmail.com`,

            }
        })
        const prompt = await question(" WHAT GAME DO YOU WANT TO BUILD?")

        const session = await prisma.session.create({
            data: {
                userId: user.id,
                prompt: prompt as string,
                status: 'INIT',
                createdAt: new Date().toISOString()
            }
        })

        if (session.id) {
            console.log("Session created successfully: ", session.id)
        }
        const controller = new Controller(session.id);

        let message = ''

        while (true) {

            const result = await controller.start(message);

            switch (result.type) {
                case "INIT":
                // console.log(result.data)
                // break;
                case "CLARIFYING":
                    const data = result.data as ClarificationResponse

                    if (data.isSufficient) {
                        console.log("\n Questions CLarifed!\n")
                        console.log(`\n Summary: ${data.summary}\n`)
                        break;
                    }
                    console.log("\nAgent needs some clarification to build\n")
                    console.log("-".repeat(50))
                    console.log(`Summary: ${data.summary}`);

                    console.log(`Questions:\n`)
                    data.questions.forEach((q: string, i: number) => console.log(`${i + 1}. ${q}`))

                    console.log("-".repeat(50))

                    message = await question("Answer: ") as string

                    break;

                case "PLANNING":
                    console.log("\n Agent working on the plan\n");
                    console.log("--- (This might take a moment)\n");

                    const plan = result.data as PlanResponse;
                    console.log(("\n Planning completed\n"))
                    break;
                case 'CODING':
                    console.log("\n Writing code...\n");
                    console.log("--- (This might take a moment)\n");
                    const code = result.data as BuildResponse;
                    console.log("\n Code written\n")
                    break;
                case 'COMPLETED':

                    console.log("\n Build completed\n");
                    console.log("--- (This might take a moment)\n");
                    const build = result.data as BuildResponse;
                    const outputDir = path.join(__dirname, 'output', user.id); // Include user.id in base path

                    if (!fs.existsSync(outputDir)) {
                        fs.mkdirSync(outputDir, { recursive: true }); // Recursive creation
                    }
                    console.log(`\n📂 Writing files to: ${outputDir}`);

                    build.files.forEach(file => {
                        const filepath = path.join(outputDir, file.filename);

                        fs.writeFileSync(filepath, file.content)
                        console.log(`   - Saved ${file.filename}`)
                    })
                    console.log(`\n Game Ready to play by opening ${build.entryPoint} file\n`)
                    process.exit(0)
                    break;
                case 'ERROR':
                    console.log("\n Error: ", result.data)
                    break;
            }
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    catch (error) {
        console.error(error);
    }
    finally {
        rl.close();
    }

}
main();