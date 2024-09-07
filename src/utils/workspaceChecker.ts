import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { README_PATTERNS } from '../config/constants';

const execAsync = promisify(exec);

interface WorkspaceCheckResult {
    workspaceFolder: vscode.WorkspaceFolder;
    readmePath: string;
}

export async function performWorkspaceChecks(): Promise<WorkspaceCheckResult> {
    if (!vscode.workspace.isTrusted) {
        throw new Error('This workspace is not trusted. Please trust the workspace to use this extension.');
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        throw new Error('No workspace folder open. Please open a folder and try again.');
    }

    let selectedWorkspace: vscode.WorkspaceFolder;
    if (workspaceFolders.length > 1) {
        const selected = await vscode.window.showWorkspaceFolderPick();
        if (!selected) {
            throw new Error('No workspace selected.');
        }
        selectedWorkspace = selected;
    } else {
        selectedWorkspace = workspaceFolders[0];
    }

    const workspaceRoot = selectedWorkspace.uri.fsPath;

    // Check for Git submodules
    try {
        const { stdout } = await execAsync('git submodule status', { cwd: workspaceRoot });
        if (stdout.trim()) {
            vscode.window.showInformationMessage('Git submodules detected. README might be in a submodule.');
        }
    } catch (error) {
        // Git command failed, but we can proceed anyway
    }

    // Find README file
    let readmePath: string | undefined;
    for (const pattern of README_PATTERNS) {
        const testPath = path.join(workspaceRoot, pattern);
        try {
            await fs.access(testPath);
            readmePath = testPath;
            break;
        } catch {
            // File doesn't exist or is not accessible, continue to next pattern
        }
    }

    if (!readmePath) {
        throw new Error('README file not found in the workspace root or common locations.');
    }

    return { workspaceFolder: selectedWorkspace, readmePath };
}


