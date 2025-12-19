# Dashboard Widget Expansion Plan

## Overview
This document outlines the comprehensive widget library for the customizable dashboard, organized into 5 main categories with 27+ widget types.

## Widget Categories

### 1. Overview Metrics (7 widgets)
Simple, at-a-glance metrics displaying key performance indicators.

- **MRR** - Monthly recurring revenue (£)
- **Total Stats** - Comprehensive overview with mini chart
- **Total Revenue** - All-time revenue (£)
- **Total Clicks** - Link clicks tracked
- **Total Orders** - Completed purchases
- **Conversion Rate** - Clicks to orders (%)
- **Avg Order Value** - Average per order (£)

**Display**: Large number with optional trend indicator
**Sizes**: 1x1 (default), 2x1 (with additional context)

### 2. UTM Analytics (6 widgets)
Detailed breakdown of UTM parameters with filtering capabilities.

- **Top Campaign** - Best performing campaign with metrics
- **Top Source** - Best performing UTM source
- **Top Product** - Best selling product
- **Top Destination** - Most visited destination URL
- **Campaign List** - Ranked list of all campaigns
- **Source List** - Ranked list of all sources

**Display**: Widget components (CampaignWidget, SourceWidget, etc.)
**Features**: Filterable by specific campaign/source/product/destination
**Sizes**: 1x1 (top performer), 2x1 (expanded metrics), 1x2 (list view)

### 3. Performance Charts (4 widgets)
Visual trend analysis with mini charts.

- **Revenue Chart** - Revenue over time
- **Clicks Chart** - Click trends
- **Orders Chart** - Order volume
- **Conversion Trend** - Conversion rate over time

**Display**: Bar chart visualization with 20 data points
**Sizes**: 1x1 (mini chart), 2x1 (expanded chart with legend)

### 4. Device & Traffic (3 widgets)
Traffic analysis by device type.

- **Device Breakdown** - Pie chart of device types
- **Mobile Traffic** - Mobile visitors count and percentage
- **Desktop Traffic** - Desktop visitors count and percentage

**Display**: DeviceBreakdownCard or simple metrics
**Sizes**: 1x1 (percentage), 2x1 (detailed breakdown)

### 5. Time-based (3 widgets)
Time-specific performance metrics.

- **Today's Revenue** - Revenue today with trend
- **This Week** - Week's performance with comparison
- **Recent Activity** - Latest events list

**Display**: Number with trend indicator (↑ +12.5%)
**Sizes**: 1x1 (current value), 1x2 (timeline view)

## Implementation Details

### Widget Picker Modal Structure
```
┌─────────────────────────────────────┐
│  Select widgets        [X widgets]  │
├─────────────────────────────────────┤
│                                     │
│  Overview Metrics                   │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐          │
│  │MRR│ │Tot│ │Rev│ │Clk│ ...      │
│  └───┘ └───┘ └───┘ └───┘          │
│                                     │
│  UTM Analytics                      │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐          │
│  │Cmp│ │Src│ │Prd│ │Dst│ ...      │
│  └───┘ └───┘ └───┘ └───┘          │
│                                     │
│  Performance Charts                 │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐          │
│  │Rev│ │Clk│ │Ord│ │Cnv│          │
│  └───┘ └───┘ └───┘ └───┘          │
│                                     │
│  Device & Traffic                   │
│  ┌───┐ ┌───┐ ┌───┐                │
│  │Dev│ │Mob│ │Dsk│                │
│  └───┘ └───┘ └───┘                │
│                                     │
│  Time-based                         │
│  ┌───┐ ┌───┐ ┌───┐                │
│  │Tdy│ │Wek│ │Act│                │
│  └───┘ └───┘ └───┘                │
└─────────────────────────────────────┘
```

### Responsive Sizing

**1x1 (Single Cell)**
- Large number display
- Icon + title
- Minimal context

**2x1 (Double Width)**
- Extended metrics
- Multiple data points
- Mini charts
- Comparison data

**1x2 (Double Height)**
- List views
- Timeline displays
- Detailed breakdowns
- Multiple entries

### Widget Customization

**Filter Options** (for UTM widgets):
- Show Top Result (default)
- Filter by specific value
- Active filter indicator

**Settings Menu** (three dots):
- Filter data
- Change widget type (future)
- Export data (future)

## Technical Implementation

### Key Files Modified
1. `/app/dashboard/[companyId]/page.tsx` - Main dashboard with all widgets
2. Widget components already exist:
   - `/components/dashboard/widgets/CampaignWidget.tsx`
   - `/components/dashboard/widgets/SourceWidget.tsx`
   - `/components/dashboard/widgets/ProductWidget.tsx`
   - `/components/dashboard/widgets/DestinationWidget.tsx`

### Data Flow
```
Overview Metrics → useOverviewMetrics() hook
UTM Analytics → Widget components with API calls
Charts → Seeded random data (deterministic)
Device → DeviceBreakdownCard component
Time-based → Calculated from overview data
```

### Widget Rendering Logic
```typescript
// In MetricCardContent function
if (title === "Widget Name") {
  // Fetch/calculate data
  // Return JSX with appropriate styling
}

// In main render
{module.title === "Top Campaign" ? (
  <CampaignWidget campaignName={module.filterValue} />
) : module.title === "Revenue Chart" ? (
  // Chart rendering
) : (
  <MetricCardContent title={module.title} overview={overview} />
)}
```

## Next Steps

1. ✅ Add all icon imports
2. ✅ Create METRIC_CONFIGS for all widgets
3. ✅ Create WIDGET_CATEGORIES structure
4. ⏳ Update MetricCardContent with all widget renderings
5. ⏳ Update widget picker modal to show categories
6. ⏳ Add widget rendering logic in main component
7. ⏳ Test responsive sizing (1x1, 2x1, 1x2)

## Benefits

- **27+ widget types** across 5 categories
- **Highly customizable** with filtering options
- **Organized picker** with clear sections
- **Responsive layouts** that adapt to widget size
- **Consistent design** across all widget types
- **Extensible** - easy to add new widgets
