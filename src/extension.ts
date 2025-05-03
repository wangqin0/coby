import * as vscode from 'vscode';
import * as path from 'path';
import { DEFAULT_EXCLUSION_PATTERNS } from './patterns';

// Get exclusion patterns from settings or use defaults
function getExclusionPatterns(): string[] {
    const config = vscode.workspace.getConfiguration('coby');
    const userPatterns = config.get<string[]>('excludePatterns', []);
    
    // Combine default patterns with user-defined patterns
    return [...DEFAULT_EXCLUSION_PATTERNS, ...userPatterns];
}

// Check if a path should be excluded
function shouldExclude(name: string, patterns: string[]): boolean {
    // Updated to also handle wildcard patterns like *.log
    return patterns.some(pattern => {
        if (pattern.startsWith('*.')) {
            // Handle wildcard file extensions
            const extension = pattern.substring(1); // gets ".log" from "*.log"
            return name.endsWith(extension);
        }
        return name === pattern || 
               name.startsWith(`${pattern}/`) || 
               name.startsWith(`${pattern}\\`);
    });
}

async function isBinaryFile(uri: vscode.Uri): Promise<boolean> {
    try {
        const buffer = await vscode.workspace.fs.readFile(uri);
        const sampleSize = Math.min(8192, buffer.length);
        for (let i = 0; i < sampleSize; i++) {
            if (buffer[i] === 0) return true;
        }
        return false;
    } catch {
        return true;
    }
}

async function getDirectoryTree(uri: vscode.Uri, prefix = '', excludePatterns?: string[]): Promise<string> {
    const entries = await vscode.workspace.fs.readDirectory(uri);
    let tree = '';
    
    // Get exclusion patterns if not provided
    if (!excludePatterns) {
        excludePatterns = getExclusionPatterns();
    }

    for (const [name, type] of entries) {
        // Skip if this path should be excluded
        if (shouldExclude(name, excludePatterns)) {
            continue;
        }
        
        const childUri = vscode.Uri.joinPath(uri, name);
        
        if (type === vscode.FileType.Directory) {
            tree += `${prefix}📁 ${name}/\n`;
            tree += await getDirectoryTree(childUri, `${prefix}  `, excludePatterns);
        } else if (type === vscode.FileType.File) {
            tree += `${prefix}📄 ${name}\n`;
        }
    }
    return tree;
}

async function getFileView(uri: vscode.Uri): Promise<string | null> {
    const excludePatterns = getExclusionPatterns();
    const fileName = path.basename(uri.path);
    
    // Skip if this file should be excluded
    if (shouldExclude(fileName, excludePatterns)) {
        return null;
    }
    
    if (await isBinaryFile(uri)) {
        return null;
    }

    try {
        const content = await vscode.workspace.fs.readFile(uri);
        return `${fileName}\n\`\`\`\n${Buffer.from(content).toString('utf8')}\n\`\`\`\n\n`;
    } catch {
        return null;
    }
}

async function processDirectory(uri: vscode.Uri): Promise<string> {
    const excludePatterns = getExclusionPatterns();
    let output = `Directory Tree:\n${await getDirectoryTree(uri, '', excludePatterns)}\n\nFile Contents:\n`;
    
    async function processItem(itemUri: vscode.Uri): Promise<void> {
        const stat = await vscode.workspace.fs.stat(itemUri);
        const name = path.basename(itemUri.path);
        
        if (stat.type === vscode.FileType.Directory) {
            // Skip excluded directories
            if (shouldExclude(name, excludePatterns)) {
                return;
            }
            
            const entries = await vscode.workspace.fs.readDirectory(itemUri);
            for (const [childName] of entries) {
                await processItem(vscode.Uri.joinPath(itemUri, childName));
            }
        } else if (stat.type === vscode.FileType.File) {
            const fileView = await getFileView(itemUri);
            if (fileView) {
                output += fileView;
            }
        }
    }

    await processItem(uri);
    return output;
}

// New function to process all workspace folders
async function processAllWorkspaceFolders(): Promise<string> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    
    if (!workspaceFolders || workspaceFolders.length === 0) {
        throw new Error('No workspace folders are open');
    }
    
    let output = `# Workspace Content\n\n`;
    
    // Process each workspace folder
    for (const folder of workspaceFolders) {
        output += `## Workspace: ${folder.name}\n\n`;
        output += await processDirectory(folder.uri);
        output += `\n\n`;
    }
    
    return output;
}

export function activate(context: vscode.ExtensionContext) {
    // Register the original command
    const copyCommand = vscode.commands.registerCommand(
        'coby.copy',
        async (uri: vscode.Uri) => {
            try {
                const stat = await vscode.workspace.fs.stat(uri);
                
                let content: string;
                if (stat.type === vscode.FileType.Directory) {
                    content = await processDirectory(uri);
                } else {
                    const fileView = await getFileView(uri);
                    if (!fileView) {
                        throw new Error('Binary or unreadable file');
                    }
                    content = fileView;
                }

                await vscode.env.clipboard.writeText(content);
                vscode.window.showInformationMessage(
                    `Copied ${stat.type === vscode.FileType.Directory ? 'directory' : 'file'} content to clipboard!`
                );
            } catch (error: any) {
                vscode.window.showErrorMessage(
                    `Failed to copy content: ${error.message}`
                );
            }
        }
    );

    // Register the new command to copy all workspace folders
    const copyAllCommand = vscode.commands.registerCommand(
        'coby.copyAllWorkspaces',
        async () => {
            try {
                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: "Copying workspace content...",
                    cancellable: false
                }, async (progress) => {
                    progress.report({ increment: 0 });
                    
                    // Process all workspace folders
                    const content = await processAllWorkspaceFolders();
                    
                    // Write to clipboard
                    await vscode.env.clipboard.writeText(content);
                    
                    progress.report({ increment: 100 });
                    
                    vscode.window.showInformationMessage(
                        'Copied all workspace folders content to clipboard!'
                    );
                });
            } catch (error: any) {
                vscode.window.showErrorMessage(
                    `Failed to copy content: ${error.message}`
                );
            }
        }
    );

    context.subscriptions.push(copyCommand, copyAllCommand);
}

export function deactivate() {}