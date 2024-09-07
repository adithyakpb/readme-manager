import * as fs from 'fs/promises';
import * as path from 'path';
import ignore from 'ignore';
import { DEFAULT_IGNORE_PATTERNS } from '../../config/constants';

async function detectProjectLanguage(rootPath: string): Promise<string> {
    const files = await fs.readdir(rootPath);
    
    if (files.includes('package.json')) return 'node';
    if (files.includes('requirements.txt') || files.some(file => file.endsWith('.py'))) return 'python';
    // Add more detection logic for other frameworks/languages
    
    return 'generic';
}
// Scan repository and generate file tree
export async function generateFileTree(rootPath: string): Promise<any> {
    const ig = ignore();
    const gitignorePath = path.join(rootPath, '.gitignore');
    
    try {
        const gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
        ig.add(gitignoreContent);
    } catch (error) {
        console.log('No .gitignore file found, using default ignore patterns');
        const projectLanguage = await detectProjectLanguage(rootPath);
        const defaultPatterns = DEFAULT_IGNORE_PATTERNS[projectLanguage] || [];
        ig.add(defaultPatterns);
    }

    async function scanDir(dirPath: string): Promise<any> {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        const tree: any = {};

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            const relativePath = path.relative(rootPath, fullPath);

            if (ig.ignores(relativePath)) continue;

            if (entry.isDirectory()) {
                tree[entry.name] = await scanDir(fullPath);
            } else {
                tree[entry.name] = 'file';
            }
        }

        return tree;
    }

    return scanDir(rootPath);
}
