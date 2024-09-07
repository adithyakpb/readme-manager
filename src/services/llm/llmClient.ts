import * as vscode from 'vscode';
import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';


export async function getDefaultLLMProvider(): Promise<'openai' | 'anthropic'> {
    const config = vscode.workspace.getConfiguration('readmeManager');
    let defaultProvider = config.get('defaultLLMProvider') as 'openai' | 'anthropic' | undefined;

    if (!defaultProvider) {
        const options: vscode.QuickPickItem[] = [
            { label: 'OpenAI', description: 'Use OpenAI as the default LLM provider' },
            { label: 'Anthropic', description: 'Use Anthropic as the default LLM provider' }
        ];

        const selected = await vscode.window.showQuickPick(options, {
            placeHolder: 'Select a default LLM provider'
        });

        if (selected) {
            defaultProvider = selected.label.toLowerCase() as 'openai' | 'anthropic';
            await config.update('defaultLLMProvider', defaultProvider, vscode.ConfigurationTarget.Global);
        } else {
            throw new Error('No default LLM provider selected');
        }
    }

    return defaultProvider;
}
// LLM Client function
export function getLLMClient(choice: 'openai' | 'anthropic'): (prompt: string) => Promise<string> {
    console.log(`Initializing LLM client for ${choice}`);
    const config = vscode.workspace.getConfiguration('readmeManager');
    
    if (choice === 'openai') {
        const apiKey = config.get('openaiApiKey') as string;
        if (!apiKey) {
            throw new Error('OpenAI API key is not set. Please set it in the extension settings.');
        }
        const openai = new OpenAI({ apiKey });
        return async (prompt: string) => {
            console.log('Sending prompt to OpenAI:', prompt);
            const response = await openai.completions.create({
                model: "text-davinci-002",
                prompt: prompt,
                max_tokens: 150
            });
            console.log('Received response from OpenAI:', response.choices[0].text);
            return response.choices[0].text;
        };
    } else if (choice === 'anthropic') {
        const apiKey = config.get('anthropicApiKey') as string;
        if (!apiKey) {
            throw new Error('Anthropic API key is not set. Please set it in the extension settings.');
        }
        const anthropic = new Anthropic({ apiKey });
        return async (prompt: string) => {
            console.log('Sending prompt to Anthropic:', prompt);
            const response = await anthropic.messages.create({
                model: "claude-3-5-sonnet-20240620",
                max_tokens: 1024,
                messages: [{ role: "user", content: prompt }],
            });
            const textContent = response.content.find(item => item.type === 'text');
            if (!textContent || typeof textContent.text !== 'string') {
                throw new Error('Unexpected response format from Anthropic API');
            }
            console.log('Received response from Anthropic:', textContent.text);
            return textContent.text;
        };
    }
    throw new Error('Unsupported LLM choice');
}


