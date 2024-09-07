

// Suggest README styles
export default async function suggestReadmeStyles(): Promise<string[]> {
    return [
        'Standard (Overview, Installation, Usage, Contributing, License)',
        'Project-oriented (Features, Roadmap, FAQ)',
        'Developer-focused (API Documentation, Example Code)',
        'Minimal (Brief Description, Quick Start)'
    ];
}
