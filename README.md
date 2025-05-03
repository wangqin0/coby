# Copy Filename and Content

A VS Code extension that allows you to easily copy file names and content to your clipboard with just a few clicks. Perfect for sharing code snippets, documenting projects, or quickly transferring file information.

## Features

- **Single File Mode**: Copy a file's name and content to your clipboard
- **Directory Mode**: Copy a directory's tree structure and all contained files' content
- **Workspace Mode**: Copy the entire workspace structure and file contents
- **Smart Filtering**: Automatically excludes binary files, large files, and configurable patterns
- **Cross-platform Support**: Works on Windows, macOS, and Linux

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X or Cmd+Shift+X)
3. Search for "Copy Filename and Content"
4. Click Install

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/wangqin0/coby.git

# Navigate to the project directory
cd coby

# Install dependencies
yarn install

# Compile the extension
yarn compile

# Package the extension
npx @vscode/vsce package

# Install the VSIX file in VS Code
# Press Ctrl+Shift+P (or Cmd+Shift+P on macOS) and run "Extensions: Install from VSIX..."
```

## Usage

### Copy a Single File

1. Right-click on a file in the Explorer
2. Select "Copy Filename and Content"
3. The file's name and content will be copied to your clipboard in Markdown format

### Copy a Directory

1. Right-click on a directory in the Explorer
2. Select "Copy Filename and Content"
3. The directory structure and all contained files will be copied to your clipboard

### Copy All Workspace Content

1. Press Ctrl+Shift+P (or Cmd+Shift+P on macOS)
2. Run "Copy All Workspace Content"
3. All workspace folders and their content will be copied to your clipboard

## Configuration

You can configure additional exclusion patterns in your VS Code settings:

```json
"coby.excludePatterns": [
    "*.log",
    "private_data",
    "some_large_directory"
]
```

By default, the extension already excludes common patterns like:
- Build directories (`dist`, `build`, etc.)
- Dependency directories (`node_modules`, etc.)
- System files (`.DS_Store`, etc.)
- Log files (`*.log`, etc.)
- And many more

## Output Format

The copied content follows this Markdown format:

```markdown
# For directories:
Directory Tree:
📁 directory_name/
  📄 file1.js
  📁 subfolder/
    📄 file2.js

File Contents:
file1.js
```
console.log('Hello world');
```

file2.js
```
function add(a, b) {
  return a + b;
}
```

# For single files:
file1.js
```
console.log('Hello world');
```
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Development

```bash
# Install dependencies
yarn install

# Compile the extension
yarn compile

# Watch for changes
yarn watch
```

## Release Notes

### 0.1.7
- Fixed various bugs and improved performance
- Added smart binary file detection