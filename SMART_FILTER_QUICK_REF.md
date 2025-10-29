# Smart Filter Modal - Quick Reference Card

## 🚀 Quick Start

### Import
```typescript
import { SmartFilterModal } from "@/components/SmartFilterModal";
```

### Basic Usage
```tsx
<SmartFilterModal
  metadata={metadata}
  columnFilters={columnFilters}
  fromDate={fromDate}
  toDate={toDate}
  onColumnFilterChange={handleColumnFilter}
  onFromDateChange={(date) => setFromDate(date)}
  onToDateChange={(date) => setToDate(date)}
  onClearAll={handleClearAllFilters}
/>
```

## 📋 Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `metadata` | `EntityMetadata \| null` | ✅ Yes | Table metadata with columns |
| `columnFilters` | `Record<string, string>` | ✅ Yes | Active column filters |
| `fromDate` | `string` | ✅ Yes | Start date for range |
| `toDate` | `string` | ✅ Yes | End date for range |
| `onColumnFilterChange` | `(name: string, value: string) => void` | ✅ Yes | Column filter change handler |
| `onFromDateChange` | `(date: string) => void` | ✅ Yes | From date change handler |
| `onToDateChange` | `(date: string) => void` | ✅ Yes | To date change handler |
| `onClearAll` | `() => void` | ✅ Yes | Clear all filters handler |
| `className` | `string` | ❌ No | Additional CSS classes |

## 🎯 State Management

### Required State
```typescript
const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
const [fromDate, setFromDate] = useState<string>("");
const [toDate, setToDate] = useState<string>("");
```

### Required Handlers
```typescript
const handleColumnFilter = (columnName: string, value: string) => {
  setColumnFilters((prev) => {
    const newFilters = { ...prev };
    if (value) {
      newFilters[columnName] = value;
    } else {
      delete newFilters[columnName];
    }
    return newFilters;
  });
  resetToFirstPage();
};

const handleClearAllFilters = () => {
  setColumnFilters({});
  setFromDate("");
  setToDate("");
  resetToFirstPage();
};
```

## 🎨 Features

| Feature | Status | Description |
|---------|--------|-------------|
| Fixed Size Modal | ✅ | Max width 2xl, height 80vh |
| Scrollable Content | ✅ | ScrollArea for many filters |
| Date Range Filter | ✅ | From/To dates with validation |
| Column Filters | ✅ | Text, Number, Date, Enum, Boolean |
| Active Count Badge | ✅ | Shows filter count on button |
| Clear All | ✅ | Single click to reset all |
| Individual Clear | ✅ | Clear button per filter |
| Keyboard Support | ✅ | Tab, Enter, ESC navigation |
| Responsive | ✅ | Works on all screen sizes |
| Accessible | ✅ | Screen reader support |

## 🎭 Column Filter Types

### TEXT
```tsx
<Input
  type="text"
  placeholder="Search..."
  value={columnFilters[column.name] || ""}
  onChange={(e) => onColumnFilterChange(column.name, e.target.value)}
/>
```

### NUMBER
```tsx
<Input
  type="number"
  placeholder="Enter number..."
  value={columnFilters[column.name] || ""}
  onChange={(e) => onColumnFilterChange(column.name, e.target.value)}
/>
```

### DATE
```tsx
<Input
  type="date"
  value={columnFilters[column.name] || ""}
  onChange={(e) => onColumnFilterChange(column.name, e.target.value)}
/>
```

### ENUM
```tsx
<Select
  value={columnFilters[column.name] || "__all__"}
  onValueChange={(value) => 
    onColumnFilterChange(column.name, value === "__all__" ? "" : value)
  }
>
  <SelectItem value="__all__">All</SelectItem>
  {column.enumValues.map(option => (
    <SelectItem value={option}>{option}</SelectItem>
  ))}
</Select>
```

### BOOLEAN
```tsx
<Select
  value={columnFilters[column.name] || "__all__"}
  onValueChange={(value) => 
    onColumnFilterChange(column.name, value === "__all__" ? "" : value)
  }
>
  <SelectItem value="__all__">All</SelectItem>
  <SelectItem value="true">Yes</SelectItem>
  <SelectItem value="false">No</SelectItem>
</Select>
```

## 📊 Filter Count Logic

```typescript
const activeColumnFilters = Object.keys(columnFilters)
  .filter(key => columnFilters[key]).length;

const hasDateFilter = fromDate || toDate;

const activeFilterCount = activeColumnFilters + (hasDateFilter ? 1 : 0);
```

## 🎨 Styling Classes

| Element | Classes |
|---------|---------|
| Button | `glass-hover border-border` |
| Button (Active) | `border-primary text-primary` |
| Modal Content | `max-w-2xl max-h-[80vh]` |
| Section Headers | `text-sm font-semibold` |
| Input Fields | `glass border-border focus:border-primary` |
| Clear Buttons | `hover:bg-destructive/10 hover:text-destructive` |

## 🔧 Customization

### Custom Button Class
```tsx
<SmartFilterModal
  className="custom-button-class"
  {...otherProps}
/>
```

### Custom Filter Logic
```typescript
const handleColumnFilter = (columnName: string, value: string) => {
  // Add custom validation
  if (value && value.length < 2) return;
  
  // Your custom logic here
  setColumnFilters(prev => ({
    ...prev,
    [columnName]: value
  }));
};
```

## 🐛 Common Issues

### Issue: Filters not applying
**Solution**: Ensure you're passing the filter values to your data fetch function

### Issue: Modal not opening
**Solution**: Check that `metadata` is not null

### Issue: Count not updating
**Solution**: Verify filter count calculation logic

### Issue: Clear not working
**Solution**: Make sure handlers update state correctly

## 📦 Dependencies

```json
{
  "@radix-ui/react-dialog": "^1.0.0",
  "@radix-ui/react-scroll-area": "^1.0.0",
  "lucide-react": "^0.263.1"
}
```

## 🎯 Integration Checklist

- [ ] Import SmartFilterModal component
- [ ] Create required state variables
- [ ] Implement handler functions
- [ ] Pass metadata to component
- [ ] Connect filter changes to data fetch
- [ ] Test all filter types
- [ ] Verify clear functionality
- [ ] Check active count display
- [ ] Test responsive behavior
- [ ] Verify keyboard navigation

## 📚 Documentation Links

- **Feature Documentation**: [SMART_FILTER_MODAL_FEATURE.md](./SMART_FILTER_MODAL_FEATURE.md)
- **User Guide**: [SMART_FILTER_USER_GUIDE.md](./SMART_FILTER_USER_GUIDE.md)
- **Comparison**: [SMART_FILTER_COMPARISON.md](./SMART_FILTER_COMPARISON.md)
- **Visual Demo**: [SMART_FILTER_VISUAL_DEMO.md](./SMART_FILTER_VISUAL_DEMO.md)

## 🎉 Quick Tips

1. **Date Range** counts as 1 filter regardless of one or both dates set
2. **Empty string** removes a filter (use `""` not `null`)
3. **"__all__"** is the magic value for "no filter" in dropdowns
4. **Clear All** resets everything including date range
5. **Filters persist** when modal is reopened (by design)

## 💡 Best Practices

✅ **DO**: Use controlled components
✅ **DO**: Reset to page 1 when filters change
✅ **DO**: Provide loading states during filter apply
✅ **DO**: Validate filter values before applying
✅ **DO**: Show filter count in UI

❌ **DON'T**: Use uncontrolled inputs
❌ **DON'T**: Forget to handle empty states
❌ **DON'T**: Apply filters without user action
❌ **DON'T**: Ignore accessibility requirements
❌ **DON'T**: Skip keyboard navigation support

## 🚀 Performance Tips

- Use `useCallback` for handler functions
- Memoize filter count calculations
- Debounce text input filters
- Lazy load filter options if large
- Use virtual scrolling for many filters

## 📞 Support

**File**: `/src/components/SmartFilterModal.tsx`
**Lines**: 310
**TypeScript**: Full type safety
**Tests**: Manual testing complete
**Status**: ✅ Production ready

---

**Quick Reference Version**: 1.0
**Last Updated**: October 28, 2025
**Component Version**: 1.0.0
