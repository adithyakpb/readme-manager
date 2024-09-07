import { getPrompt } from '../prompts/promptLoader';

// Analyze repository and generate README
export async function generateReadme(
    fileTree: any, 
    llmClient: (prompt: string) => Promise<string>,
    userInstructions: string
): Promise<string> {
    const fileTreePrompt = await getPrompt('fileTreeAnalysis');
    const fullFileTreePrompt = fileTreePrompt + JSON.stringify(fileTree);
    console.log('Sending file tree analysis prompt to LLM:', fullFileTreePrompt);
    const fileTreeAnalysis = await llmClient(fullFileTreePrompt);
    console.log('Received file tree analysis from LLM:', fileTreeAnalysis);

    const readmePrompt = await getPrompt('readmeGeneration');
    const fullReadmePrompt = `${readmePrompt}\n\nUser Instructions: ${userInstructions}\n\nFile Tree Analysis: ${fileTreeAnalysis}`;
    console.log('Sending README generation prompt to LLM:', fullReadmePrompt);
    const readme = await llmClient(fullReadmePrompt);
    console.log('Received generated README from LLM:', readme);

    return readme;
}
