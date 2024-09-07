// prompts.ts

export type PromptKey = 'fileTreeAnalysis' | 'readmeGeneration' | 'readmeAnalysis';

const prompts: Record<PromptKey, string> = {
  fileTreeAnalysis: "Analyze this file tree and identify the most important files and directories: ",
  readmeGeneration: "Based on this analysis of the repository, generate a README.md file. Remember you must generate only the README content and nothing else.",
  readmeAnalysis: "Analyse with given FILE TREE, what changes to the given README file is needed. If a change is required, output: update needed: yes. Else if no changes are required, output: update needed: no",
};

export default prompts;