import * as vscode from 'vscode';
import { getPrompt } from '../prompts/promptLoader';

async function analyzeExistingReadme(
    readmeContent: string, 
    fileTree: any, 
    llmClient: (prompt: string) => Promise<string>
): Promise<{ needsUpdate: boolean; suggestedChanges?: string }> {
    console.log('Analyzing existing README');
    const analyzePrompt = await getPrompt('readmeAnalysis');
    const fullPrompt = analyzePrompt + JSON.stringify(fileTree) + "\n\nExisting README:\n" + readmeContent;
    console.log('Sending analysis prompt to LLM:', fullPrompt);
    const analysis = await llmClient(fullPrompt);
    console.log('Received analysis from LLM:', analysis);
    const needsUpdate = analysis.toLowerCase().includes('update needed: yes');
    return {
        needsUpdate,
        suggestedChanges: needsUpdate ? analysis : undefined
    };
}


export default analyzeExistingReadme;