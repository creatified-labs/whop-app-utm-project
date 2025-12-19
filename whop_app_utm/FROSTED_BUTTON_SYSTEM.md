# Frosted Button System - Implementation Guide

## Summary
Created a comprehensive button component system with consistent Frosted glass styling across all variants. The FrostedButton component provides primary, secondary, ghost, and danger variants with proper states, sizes, and loading indicators.

## Component: FrostedButton

**File:** `components/ui/FrostedButton.tsx`

### Props

```typescript
interface FrostedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
```

## Button Variants

### 1. Primary (Solid)

**Use for:** Main call-to-action buttons, primary actions

**Styling:**
- Background: `bg-black dark:bg-white` (solid, not glass)
- Text: `text-white dark:text-black`
- Hover: `hover:bg-black/90 dark:hover:bg-white/90`
- Shadow: `shadow-lg`

**Examples:**
```tsx
<FrostedButton variant="primary">
  New Link
</FrostedButton>

<FrostedButton variant="primary" size="lg">
  Generate Link
</FrostedButton>

<FrostedButton variant="primary" isLoading>
  Saving...
</FrostedButton>
```

**Use Cases:**
- "New Link" button
- "Save" in forms
- "Create" actions
- "Generate" buttons
- "Submit" buttons
- "Upgrade" CTAs

### 2. Secondary (Glass)

**Use for:** Secondary actions, cancel buttons, alternative options

**Styling:**
- Background: `bg-white/10 dark:bg-black/10`
- Backdrop blur: `backdrop-blur-xl`
- Border: `border-white/20 dark:border-white/10`
- Hover: `hover:bg-white/20`

**Examples:**
```tsx
<FrostedButton variant="secondary">
  Cancel
</FrostedButton>

<FrostedButton variant="secondary" size="sm">
  Back
</FrostedButton>

<FrostedButton variant="secondary" leftIcon={<Filter />}>
  Filters
</FrostedButton>
```

**Use Cases:**
- "Cancel" buttons
- "Back" buttons
- "Close" buttons
- Filter toggles
- Sort options
- Alternative actions

### 3. Ghost (Transparent)

**Use for:** Subtle actions, icon buttons, tertiary actions

**Styling:**
- Background: `bg-transparent`
- Hover: `hover:bg-white/10`
- No border
- Minimal visual weight

**Examples:**
```tsx
<FrostedButton variant="ghost" size="sm">
  <X className="h-4 w-4" />
</FrostedButton>

<FrostedButton variant="ghost">
  Learn More
</FrostedButton>

<FrostedButton variant="ghost" leftIcon={<Settings />}>
  Settings
</FrostedButton>
```

**Use Cases:**
- Close buttons (×)
- Menu buttons (⋯)
- Icon-only buttons
- Subtle text links
- Tertiary actions
- Dropdown triggers

### 4. Danger (Destructive)

**Use for:** Destructive actions, delete buttons, warnings

**Styling:**
- Background: `bg-red-500/10`
- Border: `border-red-400/30`
- Text: `text-red-400`
- Hover: `hover:bg-red-500/20`

**Examples:**
```tsx
<FrostedButton variant="danger">
  Delete
</FrostedButton>

<FrostedButton variant="danger" size="sm">
  Remove
</FrostedButton>

<FrostedButton variant="danger" isLoading>
  Deleting...
</FrostedButton>
```

**Use Cases:**
- "Delete" buttons
- "Remove" actions
- "Archive" (destructive)
- "Disconnect" actions
- Warning confirmations

## Button Sizes

### Small (sm)
- Height: `h-9` (36px)
- Padding: `px-3 py-2`
- Text: `text-xs`

**Use for:** Compact UIs, table actions, inline buttons

```tsx
<FrostedButton variant="secondary" size="sm">
  Edit
</FrostedButton>
```

### Medium (md) - Default
- Height: `h-10` (40px)
- Padding: `px-4 py-2.5`
- Text: `text-sm`

**Use for:** Most buttons, forms, standard actions

```tsx
<FrostedButton variant="primary">
  Save Changes
</FrostedButton>
```

### Large (lg)
- Height: `h-12` (48px)
- Padding: `px-6 py-3`
- Text: `text-base`

**Use for:** Hero CTAs, important actions, landing pages

```tsx
<FrostedButton variant="primary" size="lg">
  Get Started
</FrostedButton>
```

## Button States

### Default
Normal interactive state with hover effects

### Hover
- Primary: Slightly darker/lighter
- Secondary: More opaque glass
- Ghost: Subtle background appears
- Danger: More intense red

### Active (Pressed)
Automatically handled by browser

### Disabled
```tsx
<FrostedButton disabled>
  Cannot Click
</FrostedButton>
```
- Opacity: `opacity-50`
- Cursor: `cursor-not-allowed`
- No hover effects

### Loading
```tsx
<FrostedButton isLoading>
  Processing...
</FrostedButton>
```
- Shows spinner icon
- Text becomes invisible (`opacity-0`)
- Button disabled
- Spinner matches button color

## Icons

### Left Icon
```tsx
<FrostedButton leftIcon={<Plus className="h-4 w-4" />}>
  New Link
</FrostedButton>
```

### Right Icon
```tsx
<FrostedButton rightIcon={<ChevronRight className="h-4 w-4" />}>
  Next
</FrostedButton>
```

### Icon Only
```tsx
<FrostedButton variant="ghost" size="sm">
  <Settings className="h-4 w-4" />
</FrostedButton>
```

## Button Groups

### Horizontal Group
```tsx
<div className="flex items-center gap-2">
  <FrostedButton variant="secondary">
    Cancel
  </FrostedButton>
  <FrostedButton variant="primary">
    Save
  </FrostedButton>
</div>
```

### Vertical Stack
```tsx
<div className="flex flex-col gap-2">
  <FrostedButton variant="primary">
    Option 1
  </FrostedButton>
  <FrostedButton variant="secondary">
    Option 2
  </FrostedButton>
</div>
```

### Segmented Control
```tsx
<div className="inline-flex rounded-xl bg-white/5 p-1">
  <FrostedButton 
    variant={active === 'all' ? 'secondary' : 'ghost'}
    size="sm"
  >
    All
  </FrostedButton>
  <FrostedButton 
    variant={active === 'archived' ? 'secondary' : 'ghost'}
    size="sm"
  >
    Archived
  </FrostedButton>
</div>
```

## Migration Guide

### Before (Standard Button)
```tsx
<button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
  Click Me
</button>
```

### After (FrostedButton)
```tsx
<FrostedButton variant="primary">
  Click Me
</FrostedButton>
```

### Before (Secondary Button)
```tsx
<button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
  Cancel
</button>
```

### After (FrostedButton)
```tsx
<FrostedButton variant="secondary">
  Cancel
</FrostedButton>
```

### Before (Icon Button)
```tsx
<button className="p-2 hover:bg-gray-100 rounded-full">
  <X className="h-4 w-4" />
</button>
```

### After (FrostedButton)
```tsx
<FrostedButton variant="ghost" size="sm">
  <X className="h-4 w-4" />
</FrostedButton>
```

## Common Patterns

### Form Actions
```tsx
<div className="flex justify-end gap-2">
  <FrostedButton variant="secondary" onClick={onCancel}>
    Cancel
  </FrostedButton>
  <FrostedButton variant="primary" type="submit" isLoading={saving}>
    Save Changes
  </FrostedButton>
</div>
```

### Modal Actions
```tsx
<div className="flex justify-between gap-2">
  <FrostedButton variant="danger" onClick={onDelete}>
    Delete
  </FrostedButton>
  <div className="flex gap-2">
    <FrostedButton variant="secondary" onClick={onClose}>
      Cancel
    </FrostedButton>
    <FrostedButton variant="primary" onClick={onConfirm}>
      Confirm
    </FrostedButton>
  </div>
</div>
```

### Toolbar Actions
```tsx
<div className="flex items-center gap-2">
  <FrostedButton variant="primary" leftIcon={<Plus />}>
    New Link
  </FrostedButton>
  <FrostedButton variant="secondary" leftIcon={<Upload />}>
    Import
  </FrostedButton>
  <FrostedButton variant="ghost" size="sm">
    <MoreVertical className="h-4 w-4" />
  </FrostedButton>
</div>
```

### Loading State
```tsx
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  await saveData();
  setLoading(false);
};

<FrostedButton 
  variant="primary" 
  onClick={handleSubmit}
  isLoading={loading}
>
  Save
</FrostedButton>
```

## Badges & Pills

### Plan Badge
```tsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-xl border border-white/20">
  Pro
</span>
```

### Status Badge
```tsx
<span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-500/10 border border-green-400/30 text-green-400">
  Active
</span>
```

### Tag Badge
```tsx
<span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
  <Tag className="h-3 w-3" />
  Marketing
</span>
```

## Tabs & Segmented Controls

### Tab Navigation
```tsx
<div className="flex gap-1 border-b border-white/10">
  <button 
    className={`px-4 py-2 text-sm font-medium transition-colors ${
      active === 'all' 
        ? 'text-foreground border-b-2 border-blue-500' 
        : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    All Links
  </button>
  <button 
    className={`px-4 py-2 text-sm font-medium transition-colors ${
      active === 'archived' 
        ? 'text-foreground border-b-2 border-blue-500' 
        : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    Archived
  </button>
</div>
```

### Segmented Control (Glass)
```tsx
<div className="inline-flex rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 p-1">
  <button 
    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
      active === 'day' 
        ? 'bg-white/20 text-foreground' 
        : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    Day
  </button>
  <button 
    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
      active === 'week' 
        ? 'bg-white/20 text-foreground' 
        : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    Week
  </button>
  <button 
    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
      active === 'month' 
        ? 'bg-white/20 text-foreground' 
        : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    Month
  </button>
</div>
```

## Accessibility

### Keyboard Navigation
- Tab: Focus next button
- Shift+Tab: Focus previous button
- Enter/Space: Activate button
- Escape: Cancel (in modals)

### Screen Readers
```tsx
<FrostedButton 
  variant="ghost"
  aria-label="Close modal"
>
  <X className="h-4 w-4" />
</FrostedButton>
```

### Focus States
All buttons have visible focus rings:
- Primary: `focus:ring-black/20`
- Secondary: `focus:ring-white/10`
- Ghost: `focus:ring-white/10`
- Danger: `focus:ring-red-400/20`

## Best Practices

### Do's ✅
- Use primary for main CTAs
- Use secondary for alternative actions
- Use ghost for subtle actions
- Use danger for destructive actions
- Show loading state during async operations
- Provide aria-label for icon-only buttons
- Group related buttons with consistent spacing

### Don'ts ❌
- Don't use multiple primary buttons in same context
- Don't use danger variant for non-destructive actions
- Don't forget loading states
- Don't use tiny text in buttons
- Don't stack too many buttons vertically
- Don't use glass effect on primary CTAs

## Testing Checklist

- [ ] All button variants render correctly
- [ ] Hover states work smoothly
- [ ] Loading states show spinner
- [ ] Disabled states prevent clicks
- [ ] Icons align properly
- [ ] Focus states visible
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Dark mode looks good
- [ ] Light mode looks good
- [ ] Mobile responsive
- [ ] Touch targets adequate (min 44x44px)

---

**Status:** ✅ Component created - Ready for implementation across the app!

**Next Steps:**
1. Update all primary action buttons
2. Update all secondary action buttons
3. Update all ghost/icon buttons
4. Update badges and pills
5. Update tabs and segmented controls
6. Test all button states
7. Verify accessibility
