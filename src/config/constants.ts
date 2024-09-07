export const MAX_FILE_SIZE = 1024 * 1024; // 1MB
export const README_PATTERNS = ['README.md', 'README.txt', 'README', 'readme.md', 'readme.txt', 'readme'];
export const DEFAULT_IGNORE_PATTERNS: { [key: string]: string[] } = {
    node: [
        'node_modules',
        'npm-debug.log',
        'yarn-debug.log',
        'yarn-error.log',
        '.pnp',
        '.pnp.js',
        'coverage',
        'build',
        'dist',
    ],
    python: [
        '__pycache__',
        '*.pyc',
        '*.pyo',
        '*.pyd',
        '.Python',
        'env',
        'venv',
        'ENV',
        'env.bak',
        'venv.bak',
        '.env',
    ],
    // Add more frameworks/languages as needed
};

