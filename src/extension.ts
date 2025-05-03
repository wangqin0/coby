import * as vscode from 'vscode';
import * as path from 'path';
import { 
    DEFAULT_EXCLUSION_PATTERNS, 
    BINARY_FILE_EXTENSIONS, 
    TEXT_FILE_EXTENSIONS,
    ALWAYS_INCLUDE_FILES,
    LOCK_FILES
} from './patterns';

// Get exclusion patterns from settings or use defaults
function getExclusionPatterns(): string[] {
    const config = vscode.workspace.getConfiguration('coby');
    const userPatterns = config.get<string[]>('excludePatterns', []);
    
    // Combine default patterns with user-defined patterns
    return [...DEFAULT_EXCLUSION_PATTERNS, ...userPatterns];
}

// Check if a path should be excluded
function shouldExclude(name: string, patterns: string[]): boolean {
    // Files that we always want to include (override all exclusion patterns)
    if (ALWAYS_INCLUDE_FILES.includes(name)) {
        return false;
    }
    
    // Lock files should always be excluded (they're too large)
    if (LOCK_FILES.includes(name)) {
        return true;
    }
    
    // Check file extension against the TEXT_FILE_EXTENSIONS list
    const extension = path.extname(name).toLowerCase();
    if (TEXT_FILE_EXTENSIONS.includes(extension)) {
        // For text files, we'll still respect exclusion patterns
        // This allows excluding specific text files if needed
    }
    
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

// Improved binary file detection with extension-based approach
async function isBinaryFile(uri: vscode.Uri): Promise<boolean> {
    try {
        const filePath = uri.fsPath;
        const extension = path.extname(filePath).toLowerCase();
        const fileName = path.basename(filePath);
        
        // First check: is this a lock file we want to exclude?
        if (LOCK_FILES.includes(fileName)) {
            console.log(`Skipping lock file: ${fileName}`);
            return true;
        }
        
        // Second check: is this a file we always want to include?
        if (ALWAYS_INCLUDE_FILES.includes(fileName)) {
            return false;
        }
        
        // Third check: extension-based detection
        if (BINARY_FILE_EXTENSIONS.includes(extension)) {
            return true;
        }
        
        if (TEXT_FILE_EXTENSIONS.includes(extension)) {
            return false;
        }
        
        // Third check: file size check (for files with unknown extensions)
        const buffer = await vscode.workspace.fs.readFile(uri);
        
        // Files that are too large should be considered binary to avoid performance issues
        if (buffer.length > 1024 * 1024) { // 1MB limit
            return true;
        }
        
        // Last resort: content-based detection for unknown file types
        // More sophisticated binary content check
        const sampleSize = Math.min(4096, buffer.length);
        let textChars = 0;
        let nullChars = 0;
        
        for (let i = 0; i < sampleSize; i++) {
            const byte = buffer[i];
            
            // Count null bytes
            if (byte === 0) {
                nullChars++;
                // If we have more than a few null bytes, it's probably binary
                if (nullChars > 3) {
                    return true;
                }
            }
            
            // Count text-like bytes
            if ((byte >= 32 && byte <= 126) || // ASCII printable
                byte === 9 || byte === 10 || byte === 13) { // Tab, LF, CR
                textChars++;
            }
        }
        
        // If most of the content looks like text, it's probably not binary
        // Consider binary if less than 80% of the content is text-like
        return (textChars / sampleSize) < 0.8;
    } catch (error) {
        console.error(`Error checking if file is binary: ${uri.fsPath}`, error);
        // If we can't read it, be conservative and consider it binary
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
    const extension = path.extname(uri.path).toLowerCase();
    
    // Logging for debugging
    console.log(`Processing file: ${uri.fsPath}`);
    
    // Check for exclusion patterns from settings
    if (shouldExclude(fileName, excludePatterns)) {
        console.log(`Excluding file based on pattern match: ${uri.fsPath}`);
        return null;
    }
    
    // Check if file is binary using our improved detection
    try {
        if (await isBinaryFile(uri)) {
            console.log(`Skipping binary file: ${uri.fsPath}`);
            return null;
        }
    
        // Read the file content with explicit UTF-8 encoding
        const content = await vscode.workspace.fs.readFile(uri);
        let textContent: string;
        
        try {
            textContent = Buffer.from(content).toString('utf8');
            
            // Additional validation that the content is actually readable text
            // If it contains too many replacement characters, it's likely not valid UTF-8
            const replacementChar = '\uFFFD';
            const replacementCount = (textContent.match(new RegExp(replacementChar, 'g')) || []).length;
            
            if (replacementCount > textContent.length * 0.1) {
                console.log(`File contains too many invalid UTF-8 characters: ${uri.fsPath}`);
                return null;
            }
            
            return `${fileName}\n\`\`\`\n${textContent}\n\`\`\`\n\n`;
        } catch (error) {
            console.error(`Error converting file content to string: ${uri.fsPath}`, error);
            return null;
        }
    } catch (error) {
        console.error(`Error reading file: ${uri.fsPath}`, error);
        return null;
    }
}

async function processDirectory(uri: vscode.Uri): Promise<string> {
    const excludePatterns = getExclusionPatterns();
    let output = `Directory Tree:\n${await getDirectoryTree(uri, '', excludePatterns)}\n\nFile Contents:\n`;
    
    async function processItem(itemUri: vscode.Uri): Promise<void> {
        try {
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
        } catch (error) {
            console.error(`Error processing item: ${itemUri.fsPath}`, error);
            // Continue with other files instead of failing the whole operation
        }
    }

    await processItem(uri);
    return output;
}

// Function to process all workspace folders
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
                        // Improved error message with more context
                        const fileName = path.basename(uri.path);
                        const extension = path.extname(uri.path).toLowerCase();
                        
                        if (BINARY_FILE_EXTENSIONS.includes(extension)) {
                            vscode.window.showWarningMessage(
                                `Skipped "${fileName}" as it's a binary file type (.${extension}).`
                            );
                        } else {
                            vscode.window.showWarningMessage(
                                `Skipped "${fileName}" as it appears to be a binary or unreadable file.`
                            );
                        }
                        return;
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

    // Register the command to copy all workspace folders
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