# Download Config Feature - Region Tab Integration

## Overview
The Download Config functionality has been moved to the Region Tab with enhanced filtering capabilities for countries, business units, and tables.

## Changes Made

### 1. RegionSelector Component (`src/components/RegionSelector.tsx`)
- **Added**: "Download Config" button in the header section
- **New Prop**: `onDownloadConfig` callback function
- **UI Enhancement**: The button is positioned next to the title for easy access

### 2. DownloadConfigModal Component (`src/components/DownloadConfigModal.tsx`)
- **Complete Redesign** with three download scope options:
  
  #### Download Scopes:
  1. **Current Search Results** (if search is active)
     - Downloads only filtered records based on active search
  
  2. **Custom Selection** (enhanced feature)
     - Select specific country using dropdown (includes "All Countries" option)
     - Select specific business unit using dropdown (includes "All Business Units" option)
     - Select specific table using dropdown (includes "All Tables" option)
     - Features:
       - Clean dropdown interface for easy selection
       - "All" option available for each category to download everything in that category
       - Real-time preview of what will be downloaded
       - Independent selection for country, business unit, and table
  
  3. **All Data**
     - Downloads configuration for all countries, business units, and tables

  #### UI Improvements:
  - Larger modal (700px width) with scrollable content
  - Vertical stacked layout for dropdown selectors
  - Visual feedback showing current selection
  - Dynamic description text showing what will be downloaded
  - Progress bar during download simulation
  - Success confirmation screen
  - Icons for each selector (Globe for Country, Building for BU, Table for Tables)

  #### Selection Options:
  - **Countries**: All Countries, UK, US, HK, SG, CN
  - **Business Units**: All Business Units, CC, WPB, CMB, GBM
  - **Tables**: All Tables, Service Profile, Main Configuration, Routing Configuration, User Management
  - Default selection: "ALL" for each category

### 3. Index Page (`src/pages/Index.tsx`)
- **Removed**: Duplicate "Download Config" button from the Config tab search bar
- **Updated**: RegionSelector component now includes the download functionality
- **Simplified**: Search bar is now standalone without the download button

## User Flow

### Opening the Download Modal:
1. Click "Download Config" button in the Region Selector header
2. Modal opens with "Custom Selection" scope pre-selected
3. No countries or business units are initially selected

### Downloading Configurations:

#### Scenario 1: Download All (Default Selection)
1. Select "All Countries" from country dropdown (default)
2. Select "All Business Units" from BU dropdown (default)
3. Select "All Tables" from table dropdown (default)
4. Click "Start Download"
5. **Result**: Downloads all configurations for all countries, business units, and tables

#### Scenario 2: Download Specific Country Data
1. Select a specific country from dropdown (e.g., "United Kingdom")
2. Keep "All Business Units" and "All Tables" selected
3. Click "Start Download"
4. **Result**: Downloads configurations for UK across all business units and tables

#### Scenario 3: Download Specific Table
1. Keep "All Countries" and "All Business Units" selected
2. Select a specific table (e.g., "Service Profile")
3. Click "Start Download"
4. **Result**: Downloads Service Profile data for all countries and business units

#### Scenario 4: Download Specific Combination
1. Select specific country (e.g., "Singapore")
2. Select specific business unit (e.g., "Corporate Center")
3. Select specific table (e.g., "Main Configuration")
4. Click "Start Download"
5. **Result**: Downloads only Main Configuration data for Singapore CC

#### Scenario 5: Download Search Results
1. Have an active search filter
2. Select "Current Search Results" radio option
3. Click "Start Download"
4. **Result**: Downloads only filtered records

#### Scenario 6: Download Everything
1. Select "All Data" radio option
2. Click "Start Download"
3. **Result**: Downloads all data (equivalent to all selections in Custom Selection)

## Key Features Implemented

### ✅ Requirements Met:
1. ✅ Download Config button in Region Tab
2. ✅ Country selection with dropdown (includes "All Countries" option)
3. ✅ Business Unit selection with dropdown (includes "All Business Units" option)
4. ✅ Table selection with dropdown (includes "All Tables" option)
5. ✅ When "All" is selected → downloads ALL configurations for that category
6. ✅ When specific items are selected → downloads only selected items
7. ✅ Visual feedback and progress indication
8. ✅ File format selection (Excel/CSV)

### Additional Enhancements:
- Clean dropdown interface for easy selection
- Real-time description of what will be downloaded
- Smooth animations and transitions
- Responsive layout
- Accessible UI with proper labels and icons
- Toast notifications on completion
- Modal state management with proper resets
- Default "ALL" selection for each category

## Technical Details

### State Management:
```typescript
const [selectedCountry, setSelectedCountry] = useState<string>("ALL");
const [selectedBusinessUnit, setSelectedBusinessUnit] = useState<string>("ALL");
const [selectedTable, setSelectedTable] = useState<string>("ALL");
const [downloadScope, setDownloadScope] = useState<"search" | "selected" | "all">("selected");
```

### Download Logic:
```typescript
// Custom Selection mode with dropdowns
const countryText = selectedCountry === "ALL" 
  ? "All countries" 
  : countries.find(c => c.value === selectedCountry)?.label;

const buText = selectedBusinessUnit === "ALL" 
  ? "All business units" 
  : businessUnits.find(bu => bu.value === selectedBusinessUnit)?.label;

const tableText = selectedTable === "ALL" 
  ? "All tables" 
  : tables.find(t => t.value === selectedTable)?.label;

downloadMessage = `${countryText}, ${buText}, ${tableText}`;
```

## Testing Checklist
- [ ] Download with "All Countries", "All Business Units", "All Tables" (default - should download everything)
- [ ] Download with specific country selected (e.g., UK)
- [ ] Download with specific business unit selected (e.g., CC)
- [ ] Download with specific table selected (e.g., Service Profile)
- [ ] Download with combination of specific country, BU, and table
- [ ] Download with mix of "All" and specific selections
- [ ] Download search results (when search is active)
- [ ] Download all data using "All Data" option
- [ ] Switch between different download scopes
- [ ] Cancel download during progress
- [ ] Verify file format selection (Excel/CSV)
- [ ] Check responsive layout on different screen sizes
- [ ] Verify dropdown selections persist while in modal
- [ ] Verify selections reset when modal reopens

## Future Enhancements
- Backend API integration for actual file generation
- Support for date range filtering
- Multi-select capability for downloading multiple specific items
- Scheduled/automated downloads
- Download history tracking
- Compression options for large datasets
- Dynamic table list from backend API

