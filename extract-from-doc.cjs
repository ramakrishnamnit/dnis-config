const fs = require('fs');
const path = require('path');

console.log('📄 Project Restoration Tool\n');

// Check if Word document exists
const docxFile = 'dnis-config-code-documentation.docx';
if (!fs.existsSync(docxFile)) {
  console.log(`❌ Error: ${docxFile} not found`);
  console.log('\n📋 Steps to create it:');
  console.log('1. Run: node generate-code-doc.js');
  console.log('2. This will create the Word document');
  console.log('3. Run this script again to restore\n');
  process.exit(1);
}

console.log('✅ Found Word document, extracting files...\n');

// Try to use docx package if available
let useDocxPackage = false;
try {
  require.resolve('docx');
  useDocxPackage = true;
} catch (e) {
  useDocxPackage = false;
}

if (useDocxPackage) {
  // Use mammoth to extract text from docx with better formatting
  let mammoth;
  try {
    mammoth = require('mammoth');
  } catch (e) {
    console.log('⚠️  mammoth package not found, trying alternative method...\n');
  }
  
  if (mammoth) {
    extractUsingMammoth(mammoth);
  } else {
    extractUsingTextFile();
  }
} else {
  extractUsingTextFile();
}

function extractUsingMammoth(mammoth) {
  mammoth.extractRawText({ path: docxFile })
    .then(result => {
      const text = result.value;
      parseAndCreateFiles(text);
    })
    .catch(err => {
      console.log('❌ Error reading Word document:', err.message);
      console.log('Trying alternative method...\n');
      extractUsingTextFile();
    });
}

function extractUsingTextFile() {
  const textFile = 'dnis-config-code-documentation.txt';
  
  if (!fs.existsSync(textFile)) {
    console.log('❌ Alternative method requires text file');
    console.log('\n📋 Steps to create it:');
    console.log('1. Open dnis-config-code-documentation.docx in Microsoft Word');
    console.log('2. Go to File → Save As');
    console.log('3. Choose "Plain Text (.txt)" format');
    console.log('4. Save as "dnis-config-code-documentation.txt"');
    console.log('5. Run this script again\n');
    console.log('💡 Or install mammoth package: npm install mammoth\n');
    process.exit(1);
  }
  
  console.log('✅ Found text file, parsing...\n');
  const text = fs.readFileSync(textFile, 'utf8');
  parseAndCreateFiles(text);
}

function parseAndCreateFiles(text) {
  const files = {};
  
  // Pattern to match FILE_START and FILE_END markers
  const fileRegex = /FILE_START:\s*([^\n]+)[\s\S]*?CONTENT_START\s*\n([\s\S]*?)\nCONTENT_END/g;
  
  let match;
  while ((match = fileRegex.exec(text)) !== null) {
    const filePath = match[1].trim();
    let content = match[2];
    
    // Clean up content - remove any extra whitespace from start/end
    // but preserve internal formatting
    content = content.replace(/^\s*\n/, '').replace(/\n\s*$/, '');
    
    files[filePath] = content;
  }
  
  // Display findings
  console.log(`📊 Found ${Object.keys(files).length} files\n`);
  
  if (Object.keys(files).length === 0) {
    console.log('⚠️  No files detected using marker pattern.');
    console.log('Trying alternative parsing method...\n');
    
    // Fallback: try simpler pattern
    const lines = text.split('\n');
    let currentFile = null;
    let currentContent = [];
    let isInContent = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('FILE_START:')) {
        // Save previous file if exists
        if (currentFile && currentContent.length > 0) {
          files[currentFile] = currentContent.join('\n').trim();
        }
        
        // Start new file
        currentFile = trimmedLine.replace('FILE_START:', '').trim();
        currentContent = [];
        isInContent = false;
      } else if (trimmedLine === 'CONTENT_START') {
        isInContent = true;
      } else if (trimmedLine === 'CONTENT_END') {
        isInContent = false;
      } else if (isInContent && currentFile) {
        currentContent.push(line);
      }
    }
    
    // Save last file
    if (currentFile && currentContent.length > 0) {
      files[currentFile] = currentContent.join('\n').trim();
    }
    
    console.log(`📊 Found ${Object.keys(files).length} files with fallback method\n`);
  }
  
  if (Object.keys(files).length === 0) {
    console.log('❌ Could not parse any files from the document.');
    console.log('Please check the document format or try regenerating it.\n');
    process.exit(1);
  }
  
  // Display files to be created
  console.log('📁 Files to be created:');
  Object.keys(files).forEach(f => console.log(`   • ${f}`));
  console.log('\n⚠️  WARNING: This will create/overwrite files in the current directory!');
  console.log('   Press Ctrl+C to cancel, or wait 3 seconds to continue...\n');
  
  // Wait before proceeding
  setTimeout(() => {
    console.log('🚀 Creating files...\n');
    
    let created = 0;
    let failed = 0;
    
    Object.entries(files).forEach(([filePath, content]) => {
      try {
        // Create directory if needed
        const dir = path.dirname(filePath);
        if (dir !== '.') {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        // Write file
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`   ✅ ${filePath}`);
        created++;
      } catch (err) {
        console.log(`   ❌ ${filePath}: ${err.message}`);
        failed++;
      }
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Created: ${created} files`);
    if (failed > 0) {
      console.log(`   ❌ Failed: ${failed} files`);
    }
    
    if (created > 0) {
      console.log('\n🎉 Restoration complete!');
      console.log('\n📋 Next steps:');
      console.log('   1. Install dependencies: npm install (or bun install)');
      console.log('   2. Run the project: npm run dev');
      console.log('   3. Optional - format code: npx prettier --write "src/**/*.{ts,tsx}"');
      console.log('   4. Optional - check linting: npm run lint\n');
    }
  }, 3000);
}