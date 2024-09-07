import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as iconv from 'iconv-lite';
import * as chardet from 'chardet';
import { MAX_FILE_SIZE } from '../../config/constants';


export async function readReadmeContent(readmePath: string): Promise<string> {
    const stats = await fs.lstat(readmePath);
    
    if (stats.isSymbolicLink()) {
        vscode.window.showInformationMessage('README is a symbolic link.');
        readmePath = await fs.realpath(readmePath);
    }

    let buffer: Buffer;
    if (stats.size > MAX_FILE_SIZE) {
        vscode.window.showWarningMessage(`README file is too large (${stats.size} bytes). Only the first ${MAX_FILE_SIZE} bytes will be read.`);
        const fileHandle = await fs.open(readmePath, 'r');
        buffer = Buffer.alloc(MAX_FILE_SIZE);
        await fileHandle.read(buffer, 0, MAX_FILE_SIZE, 0);
        await fileHandle.close();
    } else {
        buffer = await fs.readFile(readmePath);
    }

    const detectedEncoding = chardet.detect(buffer) || 'utf-8';
    const content = iconv.decode(buffer, detectedEncoding);

    if (/[\x00-\x08\x0E-\x1F]/.test(content)) {
        vscode.window.showWarningMessage('README appears to be a binary file. Content may not display correctly.');
    }

    return content;
}


