const fs = require('fs');
const path = require('path');
const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = require('docx');
const docx = require('docx');

// Directories and files to exclude
const EXCLUDE_DIRS = [
  'node_modules',
  'dist',
  '.git',
  'build',
  '.next',
  'coverage',
  '.vscode',
  '.idea'
];

const EXCLUDE_FILES = [
  '.DS_Store',
  'bun.lockb',
  'package-lock.json',
  'yarn.lock',
  '.gitignore',
  'synthi-assist-code-documentation.docx',
  'synthi-assist-code-documentation.html',
  'synthi-assist-code-documentation.txt'
];

const EXCLUDE_EXTENSIONS = [
  '.log',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.mp4',
  '.mp3',
  '.webm'
];

// File structure to store all files
const fileTree = {};

function shouldExclude(filePath, fileName) {
  // Check if in excluded directory
  const pathParts = filePath.split(path.sep);
  for (const excludeDir of EXCLUDE_DIRS) {
    if (pathParts.includes(excludeDir)) {
      return true;
    }
  }
  
  // Check if excluded file
  if (EXCLUDE_FILES.includes(fileName)) {
    return true;
  }
  
  // Check if excluded extension
  const ext = path.extname(fileName).toLowerCase();
  if (EXCLUDE_EXTENSIONS.includes(ext)) {
    return true;
  }
  
  return false;
}

function walkDirectory(dir, baseDir = dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const relativePath = path.relative(baseDir, filePath);
    
    if (shouldExclude(relativePath, file)) {
      return;
    }
    
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDirectory(filePath, baseDir);
    } else if (stat.isFile()) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        fileTree[relativePath] = content;
      } catch (err) {
        console.log(`Skipping binary file: ${relativePath}`);
      }
    }
  });
}

function buildDirectoryTree() {
  const sortedFiles = Object.keys(fileTree).sort();
  const dirStructure = {};
  
  sortedFiles.forEach(filePath => {
    const parts = filePath.split(path.sep);
    let current = dirStructure;
    
    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        // It's a file
        if (!current._files) current._files = [];
        current._files.push(part);
      } else {
        // It's a directory
        if (!current[part]) current[part] = {};
        current = current[part];
      }
    });
  });
  
  return dirStructure;
}

function renderTreeAsParagraphs(obj, indent = 0, paragraphs = []) {
  // Render directories first
  const dirs = Object.keys(obj).filter(k => k !== '_files').sort();
  dirs.forEach(dir => {
    paragraphs.push(
      new Paragraph({
        text: '  '.repeat(indent) + '📁 ' + dir + '/',
        style: 'TreeStyle',
        indent: { left: indent * 360 }
      })
    );
    renderTreeAsParagraphs(obj[dir], indent + 1, paragraphs);
  });
  
  // Then render files
  if (obj._files) {
    obj._files.sort().forEach(file => {
      paragraphs.push(
        new Paragraph({
          text: '  '.repeat(indent) + '📄 ' + file,
          style: 'TreeStyle',
          indent: { left: indent * 360 }
        })
      );
    });
  }
  
  return paragraphs;
}

function generateWordDocument() {
  const projectName = path.basename(process.cwd());
  const timestamp = new Date().toLocaleString();
  const sortedFiles = Object.keys(fileTree).sort();
  const dirStructure = buildDirectoryTree();
  
  const sections = [];
  
  // Title and Metadata
  sections.push(
    new Paragraph({
      text: `📦 ${projectName}`,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 }
    }),
    new Paragraph({
      text: `Generated: ${timestamp}`,
      spacing: { after: 100 }
    }),
    new Paragraph({
      text: `Total Files: ${sortedFiles.length}`,
      spacing: { after: 400 }
    })
  );
  
  // Directory Structure
  sections.push(
    new Paragraph({
      text: '📂 Directory Structure',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 }
    })
  );
  
  const treeParagraphs = renderTreeAsParagraphs(dirStructure);
  sections.push(...treeParagraphs);
  
  // Table of Contents
  sections.push(
    new Paragraph({
      text: '📋 Table of Contents',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 }
    })
  );
  
  sortedFiles.forEach(file => {
    sections.push(
      new Paragraph({
        text: `• ${file}`,
        spacing: { after: 50 }
      })
    );
  });
  
  // Source Files Section Header
  sections.push(
    new Paragraph({
      text: '📄 Source Files',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 }
    }),
    new Paragraph({
      text: 'Below are all source files with clear delimiters for automated extraction.',
      spacing: { after: 400 }
    })
  );
  
  // Add each file with clear markers
  sortedFiles.forEach(filePath => {
    const content = fileTree[filePath];
    
    // File marker start
    sections.push(
      new Paragraph({
        text: '═══════════════════════════════════════════════════════',
        spacing: { before: 400, after: 200 }
      }),
      new Paragraph({
        text: `FILE_START: ${filePath}`,
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 200 },
        shading: {
          fill: '3498db',
          color: 'ffffff'
        }
      }),
      new Paragraph({
        text: 'CONTENT_START',
        bold: true,
        spacing: { after: 100 }
      })
    );
    
    // File content - split by lines to preserve formatting
    const lines = content.split('\n');
    lines.forEach(line => {
      sections.push(
        new Paragraph({
          text: line,
          style: 'CodeStyle'
        })
      );
    });
    
    // File marker end
    sections.push(
      new Paragraph({
        text: 'CONTENT_END',
        bold: true,
        spacing: { before: 100, after: 200 }
      }),
      new Paragraph({
        text: `FILE_END: ${filePath}`,
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 200 },
        shading: {
          fill: '3498db',
          color: 'ffffff'
        }
      }),
      new Paragraph({
        text: '═══════════════════════════════════════════════════════',
        spacing: { after: 400 }
      })
    );
  });
  
  // Restoration Instructions
  sections.push(
    new Paragraph({
      text: '🔧 Restoration Instructions',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 }
    }),
    new Paragraph({
      text: 'To restore this project from this Word document, run the following command:',
      spacing: { after: 200 }
    }),
    new Paragraph({
      text: 'node extract-from-doc.cjs',
      style: 'CodeStyle',
      spacing: { after: 200 }
    }),
    new Paragraph({
      text: 'The script will:',
      spacing: { after: 100 }
    }),
    new Paragraph({
      text: '1. Read this Word document directly',
      spacing: { after: 50 }
    }),
    new Paragraph({
      text: '2. Parse all FILE_START/FILE_END markers',
      spacing: { after: 50 }
    }),
    new Paragraph({
      text: '3. Extract content between CONTENT_START/CONTENT_END',
      spacing: { after: 50 }
    }),
    new Paragraph({
      text: '4. Create all directories and files automatically',
      spacing: { after: 50 }
    }),
    new Paragraph({
      text: '5. Restore the complete project structure',
      spacing: { after: 200 }
    }),
    new Paragraph({
      text: 'After restoration, run: npm install && npm run dev',
      style: 'CodeStyle',
      spacing: { after: 400 }
    })
  );
  
  const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: 'CodeStyle',
          name: 'Code Style',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            font: 'Courier New',
            size: 18
          },
          paragraph: {
            spacing: { line: 240 }
          }
        },
        {
          id: 'TreeStyle',
          name: 'Tree Style',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            font: 'Courier New',
            size: 20
          }
        }
      ]
    },
    sections: [
      {
        properties: {},
        children: sections
      }
    ]
  });
  
  return doc;
}

// Main execution
console.log('🔍 Scanning project files...');
const projectRoot = process.cwd();
walkDirectory(projectRoot);

console.log(`✅ Found ${Object.keys(fileTree).length} files`);
console.log('📝 Generating Word document...');

const doc = generateWordDocument();
const outputFile = path.join(projectRoot, 'synthi-assist-code-documentation.docx');

// Use the Packer to create the document
const Packer = docx.Packer;
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputFile, buffer);
  
  console.log(`✨ Documentation generated successfully!`);
  console.log(`📄 File: ${outputFile}`);
  console.log('\n📖 Features:');
  console.log('✓ Complete folder structure');
  console.log('✓ All source files with content');
  console.log('✓ Clear FILE_START/FILE_END markers');
  console.log('✓ CONTENT_START/CONTENT_END delimiters');
  console.log('\n🔄 To restore project from this document:');
  console.log('   node extract-from-doc.cjs');
  console.log('\nYou can now easily share or backup your entire project! 🎉');
});