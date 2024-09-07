import * as vscode from 'vscode';
import { performWorkspaceChecks } from '../utils/workspaceChecker';
import { generateFileTree } from '../services/fileSystem/fileTreeGenerator';
import { getLLMClient } from '../services/llm/llmClient';
import { readReadmeContent } from '../services/fileSystem/readmeReader';
import { generateReadme } from '../utils/readmeGenerator';
import { getDefaultLLMProvider } from '../services/llm/llmClient';
// import {getUserInstructions} from 
async function getUserInstructions(): Promise<string> {
    const instructions = await vscode.window.showInputBox({
        prompt: 'Enter any specific instructions for README generation (optional)',
        placeHolder: 'E.g., Focus on API documentation, Include usage examples, etc.'
    });
    return instructions || '';
}
export async function updateReadme() {
    try {
        console.log('Activating updateReadme command');

        const { workspaceFolder, readmePath } = await performWorkspaceChecks();
        
        console.log('Generating file tree');
        const fileTree = await generateFileTree(workspaceFolder.uri.fsPath);

        console.log('Getting default LLM provider');
        const defaultProvider = await getDefaultLLMProvider();

        console.log('Prompting for LLM choice');
        const options: vscode.QuickPickItem[] = [
            { label: 'OpenAI', description: 'Use OpenAI for this README generation', picked: defaultProvider === 'openai' },
            { label: 'Anthropic', description: 'Use Anthropic for this README generation', picked: defaultProvider === 'anthropic' }
        ];
        
        const selected = await vscode.window.showQuickPick(options, {
            placeHolder: 'Select an LLM provider'
        });
        
        const llmChoice = selected ? selected.label.toLowerCase() as 'openai' | 'anthropic' : undefined;
        
        if (!llmChoice) {
            console.log('LLM choice selection cancelled');
            vscode.window.showInformationMessage('README analysis cancelled.');
            return;
        }
        console.log(`Initializing ${llmChoice} client`);
        const llmClient = getLLMClient(llmChoice as 'openai' | 'anthropic');

        console.log('Getting user-specific instructions');
        const userInstructions = await getUserInstructions();

        let existingContent: string;
        try {
            console.log('Reading existing README content');
            existingContent = await readReadmeContent(readmePath);
            console.log('Existing README content read successfully');
        } catch (error) {
            console.log('Error reading existing README:', error);
            existingContent = '';  // Set to empty string if README doesn't exist
        }

        console.log('Generating suggested README content');
        const suggestedContent = await generateReadme(fileTree, llmClient, userInstructions);

        // Create a diff view
        console.log('Creating diff view');
        const existingUri = vscode.Uri.file(readmePath);

        // Create a new untitled document with the suggested content
        const suggestedDoc = await vscode.workspace.openTextDocument({
            content: suggestedContent,
            language: 'markdown'
        });

        // Show the diff
        const title = "README Changes";
        await vscode.commands.executeCommand('vscode.diff', existingUri, suggestedDoc.uri, title);

        console.log('Diff view created successfully');
        vscode.window.showInformationMessage('README changes are shown in the diff view. Please review the changes.');

        // Prompt user for action
        const userChoice = await vscode.window.showQuickPick(
            [
                { label: 'Accept Changes', description: 'Apply the suggested changes to the README' },
                { label: 'Discard Changes', description: 'Keep the existing README without changes' },
                { label: 'Manual Edit', description: 'Open both versions for manual editing' }
            ],
            { placeHolder: 'What would you like to do with the suggested changes?' }
        );

        if (!userChoice) {
            console.log('User cancelled the operation');
            vscode.window.showInformationMessage('Operation cancelled.');
            return;
        }

        switch (userChoice.label) {
            case 'Accept Changes':
                console.log('User chose to accept changes');
                await vscode.workspace.fs.writeFile(existingUri, Buffer.from(suggestedContent));
                vscode.window.showInformationMessage('Changes applied to README successfully.');
                break;
            case 'Discard Changes':
                console.log('User chose to discard changes');
                vscode.window.showInformationMessage('Changes discarded. Existing README remains unchanged.');
                break;
            case 'Manual Edit':
                console.log('User chose to manually edit');
                await vscode.window.showTextDocument(existingUri, { viewColumn: vscode.ViewColumn.One });
                await vscode.window.showTextDocument(suggestedDoc, { viewColumn: vscode.ViewColumn.Two });
                vscode.window.showInformationMessage('Both versions opened for manual editing. Save the desired version.');
                break;
        }

    } catch (error) {
        console.error('Error occurred:', error);
        if (error instanceof Error) {
            vscode.window.showErrorMessage(`Error: ${error.message}`);
        } else {
            vscode.window.showErrorMessage('An unknown error occurred while processing README.');
        }
    }
}