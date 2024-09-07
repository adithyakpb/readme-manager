import prompts, { PromptKey } from './prompts';

// Access prompt from file
export async function getPrompt(promptName: PromptKey): Promise<string> {
	return prompts[promptName] || '';
  }

