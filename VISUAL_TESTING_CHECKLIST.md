# Visual Testing Checklist - Color Consistency

## Quick Test Guide

After the color consistency updates, use this checklist to verify all changes are working correctly across both light and dark modes.

---

## 🔄 Theme Switching
- [ ] Click the theme toggle button in the header (Sun/Moon icon)
- [ ] Verify smooth transition between light and dark modes
- [ ] Theme preference should persist on page reload

---

## 📑 Navigation & Tabs

### Header
- [ ] **Light Mode**: Header background is light with subtle border
- [ ] **Dark Mode**: Header background is dark with subtle border
- [ ] User dropdown menu has consistent colors in both modes
- [ ] Hover states on user menu items look correct

### Navigation Tabs (Config / Audio / Audit)
- [ ] **Inactive tabs**: Muted text color
- [ ] **Active tab**: Primary red color with red underline glow
- [ ] **Hover on inactive tabs**: Text color becomes more prominent
- [ ] Tabs look consistent in both light and dark modes

---

## 🗂️ Config Tab (Main Page)

### Region Selector
- [ ] Country dropdown has consistent text and border colors
- [ ] Business Unit dropdown has consistent text and border colors
- [ ] Table dropdown has consistent text and border colors
- [ ] Dropdown options have hover state (background changes on hover)
- [ ] Selected items show checkmark in primary red color

### Search & Filters
- [ ] Global search input has correct text color
- [ ] Smart Filter button shows active count badge
- [ ] Smart Filter popover opens with consistent borders
- [ ] Filter conditions have proper text colors
- [ ] Add/Remove condition buttons look correct

### Action Buttons
- [ ] "Save All" button (primary red) looks correct
- [ ] "Add Row" button (outline) has proper border and text color
- [ ] "Bulk Upload" button (outline) has proper border and text color
- [ ] "Refresh" icon button has proper styling
- [ ] All button hover states work correctly

### Pagination Controls
- [ ] Rows per page dropdown has consistent styling
- [ ] Pagination buttons have correct text and border colors
- [ ] Disabled pagination buttons appear grayed out
- [ ] Hover states on enabled buttons work correctly

---

## 🎵 Audio Tab

### Audio Asset Cards
- [ ] Card backgrounds have glassmorphic effect
- [ ] Card borders are consistent
- [ ] Playing audio card highlights with primary red color
- [ ] Card hover states work correctly

### Filters Section
- [ ] All filter inputs have correct text colors
- [ ] Type dropdown has consistent styling
- [ ] "Clear Filters" button appears correctly when filters are active

### Tab Toggle (My Uploads / All Uploads)
- [ ] Inactive tab has muted text
- [ ] Active tab has prominent text and background
- [ ] Tab switch animation is smooth

### Action Buttons
- [ ] "Upload Audio" button styling is consistent
- [ ] Play/Pause button changes state correctly
- [ ] Download button styling is consistent
- [ ] Delete button has destructive red styling

---

## 📊 Audit Tab

### View Mode Toggle (All Audit / My Audit)
- [ ] Inactive option has muted text
- [ ] Active option has primary red background
- [ ] Toggle switch is smooth

### Filters
- [ ] Action Type dropdown has consistent styling
- [ ] All filter inputs have correct text colors
- [ ] "Clear Filters" button appears when filters are active

### Timeline Cards
- [ ] Card backgrounds are glassmorphic
- [ ] Border colors are consistent
- [ ] Action badges have correct colors:
  - UPDATE: Orange/warning color
  - INSERT: Green/success color
  - DELETE: Red/destructive color
  - DOWNLOAD: Blue/info color
- [ ] Expand/collapse buttons work correctly
- [ ] Before/After change boxes have correct border colors

---

## 🔔 Modals

### Add Row Modal
- [ ] Modal backdrop is dark overlay
- [ ] Modal content has correct background and border
- [ ] Close button (X) has proper hover state
- [ ] Form labels have muted color
- [ ] Input fields have correct text color
- [ ] Input focus states show primary red ring
- [ ] Required field asterisks are red
- [ ] Enum/Select fields have consistent dropdown styling
- [ ] Boolean switches work correctly
- [ ] "Cancel" button (outline) has proper styling
- [ ] "Add Record" button (primary) has red background

### Bulk Upload Modal
- [ ] Tabs (Upload File / Review & Upload) have consistent styling
- [ ] File drop zone has correct borders
- [ ] "Browse Files" button is styled correctly
- [ ] Validation badges (Valid/Invalid) have correct colors
- [ ] Error table has consistent text colors
- [ ] "Download Errors" button styling is correct
- [ ] Upload progress bar shows primary color

### Edit Reason Modal
- [ ] Title and description text colors are correct
- [ ] Textarea has correct text color and focus state
- [ ] Character counter shows appropriate colors
- [ ] Info alert box has correct styling
- [ ] Submit button is styled correctly

### Download Config Modal
- [ ] Radio button options are styled consistently
- [ ] Dropdowns have consistent styling
- [ ] Progress bar uses primary color
- [ ] Success checkmark is green
- [ ] All text colors are correct in both themes

---

## 🎨 Color Verification Checklist

### Light Mode
- [ ] Text is dark/readable on light backgrounds
- [ ] Borders are subtle but visible
- [ ] Hover states darken slightly
- [ ] Primary red color is vibrant
- [ ] Glassmorphic effects are subtle

### Dark Mode
- [ ] Text is light/readable on dark backgrounds
- [ ] Borders are subtle but visible
- [ ] Hover states lighten slightly
- [ ] Primary red color is vibrant
- [ ] Glassmorphic effects with backdrop blur

---

## 🐛 Known Issues to Watch For

- [ ] No harsh color transitions when switching themes
- [ ] No invisible text (text color matching background)
- [ ] No border colors that disappear
- [ ] No hover states that make text unreadable
- [ ] No focus rings that are invisible

---

## ✅ Final Verification

- [ ] All tabs tested in both light and dark modes
- [ ] All modals opened and tested in both modes
- [ ] All dropdowns tested in both modes
- [ ] All buttons clicked and hover states verified
- [ ] Theme toggle works smoothly
- [ ] No console errors in browser dev tools

---

## 📝 Notes

If you find any inconsistencies:
1. Note the specific component and theme (light/dark)
2. Describe the issue (e.g., "text color is wrong", "border not visible")
3. Take a screenshot if possible
4. Check the corresponding component file in `src/components/` or `src/components/ui/`

**All tests passing? ✨ Colors are now consistent across the entire application!**

