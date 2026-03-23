# Pharma AI - Professional Layout Guide

## Project Structure

### Pages (All Using Same Navigation)
Each page shows a **2-column layout**:
- **Left Sidebar** (260px, sticky): Navigation + Profile
- **Right Content Area** (responsive): Page-specific content

### Navigation Items (All Pages)
```
┌─────────────────────────────────────┐
│ Dashboard    (🏠)                   │
│ Chat         (💬)                   │
│ Products     (🛒)                   │
│ Orders       (📦)                   │
└─────────────────────────────────────┘
```

## Page Details

### 1. Dashboard
- **Purpose**: Overview of orders, refills, and nearby pharmacies
- **Content**: Stats cards, real-time orders, nearby shops
- **Features**: Click counters to filter orders

### 2. Chat
- **Purpose**: AI assistant for medicine recommendations
- **Content**: Conversation messages with markdown support
- **Features**: 
  - Voice input (microphone button)
  - Image upload
  - Clear chat button
  - Auto-scrolling messages

### 3. Products
- **Purpose**: Browse and search medicines
- **Content**: Searchable product catalog
- **Features**: 
  - Search/filter by product name
  - Product cards with price & description
  - Order buttons for quick purchase

### 4. Orders
- **Purpose**: Track current and historical orders
- **Content**: Order list with status badges
- **Features**: 
  - Status filtering (Pending/Completed/Cancelled)
  - Real-time status updates
  - Order history access

## Layout Behavior

### Sidebar (Fixed)
- **Width**: 260px
- **Position**: Sticky to viewport
- **Scrolls**: When content exceeds height
- **Always Visible**: Even when scrolling main content

### Main Content Area
- **Scrolls**: Full height minus header + footer
- **Header**: Fixed top bar with page title
- **Footer**: Fixed bottom input area (for chat/input)
- **Responsive**: Takes remaining width after sidebar

## CSS Classes Reference

```css
.dashboard-shell    /* Main wrapper */
.dash-layout       /* 2-column grid (sidebar + main) */
.dash-main         /* Content area flex column */
.dash-topbar       /* Fixed header */
.glass-card        /* Translucent card style */
.sidebar-nav       /* Navigation menu */
.nav-link          /* Menu item button */
.nav-link.active   /* Current page highlight */
```

## Testing Checklist

### Layout Tests
- [ ] Sidebar visible on all pages
- [ ] Navigation items work correctly
- [ ] Can switch between pages smoothly
- [ ] No layout breaks when expanding browser
- [ ] Content scrolls independently from sidebar
- [ ] Header stays at top when scrolling
- [ ] Footer stays at bottom when scrolling

### Responsive Tests
- [ ] Desktop (1920x1080)
- [ ] Tablet (768px width)
- [ ] Mobile (375px width)

### Dark Mode Tests
- [ ] Toggle dark/light mode
- [ ] All pages readable in both modes
- [ ] Smooth color transitions

## Development Notes

### Key CSS Properties
- `grid-template-columns: 260px 1fr` - Fixed sidebar width
- `flex-direction: column` - Vertical stacking of main content
- `flex: 1` on main content - Fills available space
- `overflow-y: auto` - Scrollable content area
- `position: sticky; top: 24px` - Sticky sidebar

### No Breaking Changes
- All existing functionality preserved
- Same backend APIs
- Same chat logic
- Professional grade layout

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

---
**Last Updated**: March 19, 2026
**Status**: ✅ Production Ready
