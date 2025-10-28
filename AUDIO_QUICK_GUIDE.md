# Audio Manager Quick Guide 🎵

## Quick Start

### Navigate to Audio Page
1. Open the application in your browser
2. Click on the **Audio** tab in the navigation
3. You'll see the Audio Asset Management interface

### Current Audio File
- **File**: `Thank you for callin.wav`
- **Location**: `/public/audio/Thank you for callin.wav`
- **Size**: 913 KB
- **Status**: ✅ Ready to play

---

## Features Overview

### 🎵 Play Audio
- Click the **Play button** (▶) to listen
- Button changes to **Pause** (⏸) while playing
- Card shows pulsing animation during playback
- Audio stops automatically when finished

### ⬆️ Upload Audio (WAV Only)
1. Click **"Upload Audio"** button
2. Select one or more `.wav` files
3. Files will be added to the list
4. ❌ Non-WAV files will be rejected with error message

### 💾 Download Audio
- Click the **Download icon** to save audio locally
- File downloads to your default download folder

### 🗑️ Delete Audio
- Click the **Trash icon** to remove audio
- If audio is playing, it stops automatically
- Removed from the list immediately

### 🔍 Filter Audio
**4 filter options available:**
1. **File Name**: Search by filename
2. **File Type**: Filter by WAV (default: all)
3. **Uploader**: Filter by who uploaded
4. **Upload Date**: Filter by date

---

## Key Rules

### ✅ Accepted
- `.wav` files only
- Multiple files can be uploaded at once
- Any file size (within browser limits)

### ❌ Rejected
- `.mp3` files
- `.m4a` files
- Any non-WAV audio format

---

## Error Messages

| Scenario | Message |
|----------|---------|
| Upload non-WAV file | "Only WAV files are allowed. Please upload .wav files only." |
| Audio file not found | "Error loading audio file: [filename]" |
| Playback error | "Failed to play audio: [filename]" |

---

## Success Messages

| Action | Message |
|--------|---------|
| Upload | "Successfully uploaded [N] WAV file(s)" |
| Play | "Playing: [filename]" |
| Download | "Downloading: [filename]" |
| Delete | "Deleted: [filename]" |

---

## Tabs

### My Uploads
- Shows only files uploaded by you
- Current user: "John Doe" (mock)

### All Uploads
- Shows all uploaded files
- Includes system files and user uploads

---

## Visual Indicators

| State | Visual Effect |
|-------|---------------|
| Playing | 🔵 Blue pulsing card border |
| Playing | 🎵 Bouncing music icon |
| Playing | ▶️→⏸ Play button becomes Pause |
| Idle | ⚪ Normal card appearance |

---

## Pagination

- **5 files per page**
- Navigation: Previous / Next buttons
- Shows current page number

---

## File Information Display

Each audio card shows:
- 🎵 File name
- 🔢 Unique ID (badge)
- 👤 Uploader name
- 📅 Upload date
- 💾 File size

---

## Testing Checklist

- [ ] Play the existing WAV file
- [ ] Upload a new WAV file
- [ ] Try to upload MP3 (should fail)
- [ ] Download an audio file
- [ ] Delete an audio file
- [ ] Use filters to search
- [ ] Test pagination (if > 5 files)
- [ ] Play one audio while another plays

---

## Technical Details

### Audio Source Path
```javascript
const audio = new Audio(`/audio/${audioName}`);
```

### File Validation
```javascript
file.name.endsWith('.wav')
```

### Accept Attribute
```html
<input accept=".wav,audio/wav" />
```

---

## Troubleshooting

### Audio Won't Play
1. Check browser console for errors
2. Verify file exists in `/public/audio/`
3. Check file format is valid WAV
4. Try refreshing the page

### Upload Fails
1. Confirm file extension is `.wav`
2. Check file isn't corrupted
3. Ensure browser allows file uploads
4. Check browser console

### File Not Found
1. Uploaded files are stored in browser memory only
2. Refresh will clear uploaded files
3. Only files in `/public/audio/` persist

---

## Development Notes

### Adding More Audio Files
1. Place `.wav` files in `/public/audio/` folder
2. Update initial state in `AudioAssetManager.tsx`:
```typescript
const [audioAssets, setAudioAssets] = useState<AudioAsset[]>([
  {
    id: "1",
    name: "Your File.wav",
    type: "audio/wav",
    uploader: "System",
    uploadDate: "2025-10-28",
    size: "1.2 MB",
  },
  // Add more files here
]);
```

### Backend Integration (Future)
To persist uploads:
1. Create API endpoint for file upload
2. Save files to server storage
3. Update `handleFileInputChange` to call API
4. Fetch audio list from API on component mount

---

## Component Location

**File**: `/src/components/AudioAssetManager.tsx`
**Page**: `/src/pages/AudioPage.tsx`
**Route**: Navigate via Navigation Tabs

---

**Last Updated**: October 28, 2025
**Status**: ✅ Fully Functional

