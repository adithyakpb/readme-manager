import * as vscode from 'vscode';
import { updateReadme } from './commands/updateReadme';




export function activate(context: vscode.ExtensionContext) {
    console.log('Readme Manager extension is now active');

    let disposable = vscode.commands.registerCommand('readme-manager.updateReadme', updateReadme);

    context.subscriptions.push(disposable);
}

export function deactivate() {
    console.log('Readme Manager extension is now deactivated');
}