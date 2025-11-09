# Documentation Scripts

This repository includes two Node.js scripts for generating and extracting complete project documentation in Word format.

## Overview

These scripts allow you to:
- **Generate**: Create a Word document containing your entire codebase
- **Extract**: Restore a project from a Word document

This is useful for:
- Sharing complete project snapshots
- Creating backups
- Transferring projects through systems that only support document formats
- Archiving project states

## Scripts

### 1. Generate Documentation (`generate-code-doc.cjs`)

Creates a Word document with your entire project structure and source code.

**Usage:**
```bash
npm run generate-doc
```

**What it does:**
- Scans all project files (excluding node_modules, dist, etc.)
- Excludes binary files, images, audio files, and markdown documentation
- Creates a structured Word document with:
  - Project metadata (name, timestamp, file count)
  - Complete directory tree structure
  - Table of contents
  - All source files with clear delimiters
  - Restoration instructions

**Output:**
- File: `hsbc-config-code-documentation.docx`
- Location: Project root directory
- Size: ~300-400KB (depending on project size)

**Exclusions:**
- Directories: `node_modules`, `dist`, `.git`, `build`, `.next`, `coverage`, `.vscode`, `.idea`
- Files: Lock files, `.DS_Store`, generated documentation files
- Extensions: `.log`, `.png`, `.jpg`, `.svg`, `.ico`, `.mp3`, `.mp4`, `.wav`, `.md`

### 2. Extract Documentation (`extract-from-doc.cjs`)

Restores a complete project from a Word document.

**Usage:**
```bash
npm run extract-doc
```

**What it does:**
- Reads the Word document using the `mammoth` package
- Parses FILE_START/FILE_END markers
- Extracts content between CONTENT_START/CONTENT_END delimiters
- Creates all directories and files automatically
- Preserves file structure and content

**Requirements:**
- The Word document must exist: `hsbc-config-code-documentation.docx`
- Dependencies must be installed (mammoth package)

**Safety Features:**
- Lists all files to be created before proceeding
- 3-second delay with warning before creating files
- Can be cancelled with Ctrl+C

**After Extraction:**
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Dependencies

Both scripts require these packages (already in `package.json`):

```json
{
  "devDependencies": {
    "docx": "^8.5.0",
    "mammoth": "^1.11.0"
  }
}
```

Install with:
```bash
npm install
```

## File Format

The generated Word document uses a structured format with clear markers:

```
═══════════════════════════════════════════════════════
FILE_START: path/to/file.tsx
CONTENT_START
[file content here]
CONTENT_END
FILE_END: path/to/file.tsx
═══════════════════════════════════════════════════════
```

This format allows for reliable automated extraction.

## Use Cases

### 1. Project Backup
```bash
# Create backup
npm run generate-doc

# Archive the .docx file
mv hsbc-config-code-documentation.docx backups/backup-2025-10-29.docx
```

### 2. Share via Email/Document Systems
```bash
# Generate document
npm run generate-doc

# Share hsbc-config-code-documentation.docx via email or document management system
```

### 3. Restore from Backup
```bash
# Place the .docx file in project root
# Extract all files
npm run extract-doc

# Install and run
npm install
npm run dev
```

### 4. Transfer Between Environments
```bash
# In source environment
npm run generate-doc

# Transfer .docx file to target environment
# In target environment
npm run extract-doc
npm install
npm run dev
```

## Troubleshooting

### Issue: "mammoth package not found"
**Solution:**
```bash
npm install mammoth
```

### Issue: "No files detected"
**Problem:** Word document format may not be compatible

**Solution:** Convert to plain text manually:
1. Open `hsbc-config-code-documentation.docx` in Microsoft Word
2. Go to File → Save As
3. Choose "Plain Text (.txt)" format
4. Save as `hsbc-config-code-documentation.txt`
5. Run `npm run extract-doc` again

### Issue: Extract script creates/overwrites files
**Note:** This is expected behavior. The script will:
- Create new files that don't exist
- Overwrite existing files with the same name
- Always wait 3 seconds before proceeding (can be cancelled with Ctrl+C)

## Technical Details

### Generate Script
- Language: CommonJS (Node.js)
- Main library: `docx` (for creating Word documents)
- File scanning: Recursive directory traversal
- Output format: Office Open XML (.docx)

### Extract Script
- Language: CommonJS (Node.js)
- Main library: `mammoth` (for reading Word documents)
- Parsing: Regex-based marker detection
- Fallback: Line-by-line parsing if regex fails

## Notes

- Generated documentation files are automatically excluded from git (see `.gitignore`)
- The scripts exclude markdown files to avoid including documentation in the export
- Binary files are automatically skipped during generation
- The extract script preserves exact file content including whitespace and formatting

