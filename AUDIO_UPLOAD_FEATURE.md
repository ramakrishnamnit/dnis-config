# Audio Upload Feature - WAV Files Only

## Overview
The Audio Asset Manager has been updated to only accept WAV audio files and properly use audio files from the `/public/audio` folder.

## Key Changes

### 1. **WAV-Only File Upload**
- File input now only accepts `.wav` files (`accept=".wav,audio/wav"`)
- Validation checks ensure only WAV files are uploaded
- Users attempting to upload non-WAV files receive an error message
- Upload button clearly indicates WAV format requirement

### 2. **Audio Playback Integration**
- Actual audio playback using the HTML5 Audio API
- Plays audio files from `/public/audio/` directory
- Proper error handling for missing or corrupt files
- Visual feedback during playback (animated pulsing effect)
- Automatic cleanup when audio finishes playing

### 3. **File Management**
- **Upload**: Users can upload multiple WAV files at once
- **Play/Pause**: Click play button to listen to audio files
- **Download**: Download audio files from the browser
- **Delete**: Remove audio files from the list with confirmation

### 4. **Initial Audio File**
The system includes one existing audio file:
- `Thank you for callin.wav` (located in `/public/audio/`)

## File Validation

```typescript
// Validates that all files are WAV format
const invalidFiles = Array.from(files).filter(file => !file.name.endsWith('.wav'));

if (invalidFiles.length > 0) {
  toast.error(`Only WAV files are allowed. Please upload .wav files only.`);
  return;
}
```

## Audio Playback

```typescript
// Creates and plays audio from public folder
const audio = new Audio(`/audio/${audioName}`);
audio.play()
  .then(() => {
    toast.info(`Playing: ${audioName}`);
    setPlayingAudioId(audioId);
  })
  .catch((error) => {
    toast.error(`Failed to play audio: ${audioName}`);
  });
```

## User Interface Updates

### Header
- Title: "Audio Asset Management"
- Description: "Upload and manage WAV audio files for IVR and voice prompts (WAV format only)"

### Filters
- File Type filter now shows "All WAV Files" and "WAV" options only
- All filter options work with WAV files

### Audio Cards
- Visual playback indicator (pulsing animation when playing)
- File information: name, ID, uploader, upload date, size
- Action buttons: Play/Pause, Download, Delete

## Technical Implementation

### Component: `AudioAssetManager.tsx`

**Key Functions:**
1. `handleFileInputChange()` - Validates and uploads WAV files
2. `handlePlayPause()` - Plays or pauses audio files
3. `handleDownload()` - Downloads audio files
4. `handleDelete()` - Removes audio files from the list

**State Management:**
- `audioAssets` - List of uploaded audio files
- `playingAudioId` - Tracks currently playing audio
- `audioRef` - Reference to HTML Audio element

## How to Use

### Uploading WAV Files
1. Click "Upload Audio" button
2. Select one or more `.wav` files from your computer
3. Files will be validated and added to the list
4. Success toast notification appears

### Playing Audio
1. Click the Play button (▶) on any audio card
2. Audio plays from `/public/audio/` folder
3. Card shows visual animation while playing
4. Click Pause button (⏸) to stop playback

### Downloading Audio
1. Click the Download button on any audio card
2. Browser will download the audio file

### Deleting Audio
1. Click the Delete button (trash icon) on any audio card
2. File is removed from the list
3. If file is playing, it stops automatically

## Error Handling

- **Invalid File Type**: Toast error message displayed
- **Missing Audio File**: Error message if file not found in `/public/audio/`
- **Playback Error**: Toast notification for playback failures
- **File Input Reset**: Input cleared after validation failure

## Testing Checklist

- [ ] Upload a WAV file - should succeed
- [ ] Upload a non-WAV file (MP3, M4A) - should show error
- [ ] Play the existing "Thank you for callin.wav" file
- [ ] Upload multiple WAV files at once
- [ ] Delete an audio file from the list
- [ ] Download an audio file
- [ ] Filter by file name
- [ ] Filter by uploader
- [ ] Play one audio while another is playing (should stop first one)
- [ ] Delete a currently playing audio (should stop playback)

## File Structure

```
/public/audio/
  └── Thank you for callin.wav

/src/components/
  └── AudioAssetManager.tsx (updated)

/src/pages/
  └── AudioPage.tsx (unchanged)
```

## Future Enhancements

1. **Backend Integration**: Connect to actual API for persistent storage
2. **File Upload Progress**: Show progress bar for large files
3. **Waveform Visualization**: Display audio waveforms
4. **Audio Editing**: Trim, fade, or modify audio files
5. **Metadata Extraction**: Show duration, bitrate, sample rate
6. **Bulk Operations**: Delete or download multiple files at once
7. **Search and Sort**: Enhanced search and sorting capabilities
8. **Audio Preview**: Waveform preview before upload

