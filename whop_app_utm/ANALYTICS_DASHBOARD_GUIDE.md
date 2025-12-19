# Analytics Dashboard - Real Data Guide

## Overview

The Analytics Dashboard now displays **100% real data** from your UTM tracking system. All placeholder/mock data has been removed and replaced with actual metrics from your database.

---

## What's Displayed

### **Top Metrics (4 Cards)**

1. **Total Clicks**
   - Shows: Total number of sessions/clicks across all tracking links
   - Source: `advanced_link_sessions` table
   - Updates: Real-time as clicks come in

2. **Total Revenue**
   - Shows: Sum of all order amounts from tracked purchases
   - Source: `advanced_link_orders` table
   - Format: Currency with 2 decimal places

3. **Total Orders**
   - Shows: Count of all converted purchases
   - Source: `advanced_link_orders` table
   - Updates: Real-time as orders are created

4. **Conversion Rate**
   - Shows: Percentage of clicks that resulted in purchases
   - Calculation: `(Total Orders / Total Clicks) × 100`
   - Format: Percentage with 1 decimal place

---

### **UTM Source Performance Chart**

**Visual bar chart showing revenue by traffic source**

- Displays: Top 8 UTM sources by revenue
- Hover: Shows exact revenue amount
- Data: Real `utm_source` values from your tracking links
- Empty State: "No UTM source data yet. Start tracking links to see performance!"

**What you see:**
- Each bar represents a different UTM source (e.g., "facebook", "google", "email")
- Height = revenue generated from that source
- Labels below bars show the source names

---

### **Secondary Metrics (4 Small Cards)**

1. **Avg Order Value**
   - Shows: Average revenue per order
   - Calculation: `Total Revenue / Total Orders`
   - Format: Currency with 2 decimal places

2. **Total Sources**
   - Shows: Number of unique UTM sources being tracked
   - Helps: Understand traffic diversity

3. **Active Campaigns**
   - Shows: Number of unique UTM campaigns
   - Helps: Track campaign variety

4. **Best CVR**
   - Shows: Highest conversion rate among all campaigns
   - Format: Percentage with 1 decimal place

---

### **Device & Geo Analytics (2 Cards)**

#### **Device Breakdown Card**
- Shows: Traffic distribution by device type (mobile/tablet/desktop)
- Displays: Clicks, conversions, percentages, conversion rates
- Also shows: Top 5 browsers by click count
- Empty State: "No device data yet. Create a tracking link and get some clicks!"

**Data shown:**
- Device type (Mobile, Desktop, Tablet)
- Click count per device
- Conversion rate per device
- Percentage of total traffic

#### **Geo Breakdown Card**
- Shows: Top 10 countries by click count
- Displays: Country flags (emoji), country names, click counts, percentages
- Empty State: "No location data yet. Clicks from different countries will appear here."

**Data shown:**
- Country flag 🇺🇸 🇬🇧 🇨🇦
- Country name
- Click count
- Percentage of total traffic

---

### **UTM Campaigns List**

**Shows all your active UTM campaigns with performance metrics**

- Displays: Top 10 campaigns by revenue
- For each campaign:
  - Campaign name (from `utm_campaign` parameter)
  - Click count
  - Order count
  - Total revenue
  - Conversion rate (shown in circular badge)
- Empty State: "No campaign data yet. Add utm_campaign to your tracking links!"

---

### **UTM Sources List**

**Shows all your traffic sources with detailed metrics**

- Displays: Top 10 sources by revenue
- For each source:
  - Source name (from `utm_source` parameter)
  - Revenue (with progress bar)
  - Click count
  - Order count
  - Color-coded bars for visual comparison
- Empty State: "No source data yet. Add utm_source to your tracking links!"

---

## How to Use the Dashboard

### **1. Access the Dashboard**

Navigate to: `/dashboard/[companyId]/analytics`

Or use the sidebar navigation: Click "Analytics" in the dashboard menu.

### **2. Pass Company ID (Optional)**

For device and geo analytics to work, pass the `companyId` prop:

```tsx
<AnalyticsDashboard companyId="your-company-id" />
```

Without `companyId`, device and geo cards won't display (but all other metrics will work).

### **3. Interpret the Data**

**High-Level Overview:**
- Top 4 cards give you instant snapshot of performance
- Chart shows which sources drive the most revenue
- Campaign/Source lists show detailed breakdowns

**Optimization Tips:**
- Low conversion rate? Check which sources/campaigns are underperforming
- High clicks but low revenue? Your targeting might be off
- Best CVR shows which campaign to replicate
- Device breakdown helps optimize for mobile vs desktop

---

## Data Sources

All data comes from these database tables:

### **`advanced_link_sessions`**
- Stores every click with UTM parameters
- Fields used: `utm_source`, `utm_medium`, `utm_campaign`, `device_type`, `browser`, `country_code`, `country_name`

### **`advanced_link_orders`**
- Stores every purchase with attribution
- Fields used: `amount_cents`, `utm_source`, `utm_medium`, `utm_campaign`, `session_token`

### **Calculation Logic**

**Total Clicks:**
```sql
SELECT COUNT(*) FROM advanced_link_sessions;
```

**Total Revenue:**
```sql
SELECT SUM(amount_cents) / 100 FROM advanced_link_orders;
```

**Conversion Rate:**
```sql
SELECT 
  (COUNT(DISTINCT orders.id)::float / COUNT(DISTINCT sessions.id)) * 100
FROM advanced_link_sessions sessions
LEFT JOIN advanced_link_orders orders ON sessions.session_token = orders.session_token;
```

**Revenue by Source:**
```sql
SELECT 
  utm_source,
  COUNT(DISTINCT sessions.id) as clicks,
  COUNT(DISTINCT orders.id) as orders,
  SUM(orders.amount_cents) / 100 as revenue
FROM advanced_link_orders orders
LEFT JOIN advanced_link_sessions sessions ON orders.session_token = sessions.session_token
GROUP BY utm_source
ORDER BY revenue DESC;
```

---

## Empty States

The dashboard gracefully handles scenarios with no data:

### **No Clicks Yet**
- Top metrics show: 0 clicks, $0.00 revenue, 0 orders, 0.0% conversion
- Chart shows: "No UTM source data yet. Start tracking links to see performance!"
- Campaigns: "No campaign data yet. Add utm_campaign to your tracking links!"
- Sources: "No source data yet. Add utm_source to your tracking links!"

### **Clicks But No Orders**
- Shows click counts
- Revenue and orders show 0
- Conversion rate shows 0.0%
- Charts display but with minimal/no revenue bars

### **No Device/Geo Data**
- Device card: "No device data yet. Create a tracking link and get some clicks!"
- Geo card: "No location data yet. Clicks from different countries will appear here."

---

## Real-Time Updates

The dashboard uses React hooks that fetch data on mount:

- `useOverviewMetrics()` - Fetches total clicks, revenue, orders, conversion rate
- `useSourceMetrics()` - Fetches UTM source breakdown
- `useCampaignMetrics()` - Fetches UTM campaign breakdown

**To see updates:**
1. Create a tracking link with UTM parameters
2. Click the link (creates session)
3. Complete a purchase (creates order)
4. Refresh the analytics page
5. See updated numbers!

---

## UTM Parameters Tracked

The dashboard displays data for these UTM parameters:

### **Always Shown:**
- ✅ `utm_source` - Traffic source (e.g., "facebook", "google", "email")
- ✅ `utm_medium` - Marketing medium (e.g., "cpc", "social", "email")
- ✅ `utm_campaign` - Campaign name (e.g., "summer_sale", "launch_2024")

### **Also Tracked (Not Yet Displayed):**
- `utm_content` - Ad variation (stored in database, can be added to dashboard)
- `utm_term` - Keyword (stored in database, can be added to dashboard)

**To add utm_content and utm_term to the dashboard:**
Update the hooks to include these fields in the metrics calculations.

---

## Performance Considerations

### **Data Loading**
- All metrics load on component mount
- Uses client-side React hooks
- No server-side rendering for metrics (keeps dashboard interactive)

### **Large Datasets**
- Charts show top 8 sources (prevents overcrowding)
- Campaign list shows top 10 (scrollable if needed)
- Source list shows top 10 (scrollable if needed)

### **Optimization Tips**
- Add database indexes on `utm_source`, `utm_campaign` (already done in migration)
- Consider caching for high-traffic dashboards
- Use pagination for very large datasets

---

## Troubleshooting

### **Issue: All metrics show 0**

**Cause:** No data in database yet

**Solution:**
1. Create a tracking link with UTM parameters
2. Click the link to create a session
3. Complete a test purchase
4. Refresh dashboard

### **Issue: Clicks show but no revenue**

**Cause:** Clicks recorded but no purchases yet

**Solution:** This is normal - conversion takes time. Check:
- Are webhooks working? (Check `/api/webhooks/route.ts` logs)
- Did the purchase complete successfully?
- Is the session token being passed correctly?

### **Issue: Device/Geo cards not showing**

**Cause:** `companyId` prop not passed to `AnalyticsDashboard`

**Solution:**
```tsx
<AnalyticsDashboard companyId="your-company-id" />
```

### **Issue: Wrong numbers displayed**

**Cause:** Data mismatch or calculation error

**Solution:** Verify with SQL:
```sql
-- Check total clicks
SELECT COUNT(*) FROM advanced_link_sessions;

-- Check total revenue
SELECT SUM(amount_cents) / 100 FROM advanced_link_orders;

-- Check attribution
SELECT 
  COUNT(DISTINCT s.id) as clicks,
  COUNT(DISTINCT o.id) as orders
FROM advanced_link_sessions s
LEFT JOIN advanced_link_orders o ON s.session_token = o.session_token;
```

---

## Testing the Dashboard

### **1. Create Test Data**

```sql
-- Check if you have sessions
SELECT COUNT(*) FROM advanced_link_sessions;

-- Check if you have orders
SELECT COUNT(*) FROM advanced_link_orders;

-- Check UTM distribution
SELECT utm_source, COUNT(*) FROM advanced_link_sessions GROUP BY utm_source;
```

### **2. Create Test Tracking Link**

1. Go to your links page
2. Create a new advanced tracking link
3. Set UTM parameters:
   - Source: "test_source"
   - Medium: "test_medium"
   - Campaign: "test_campaign"
4. Click the link
5. Complete a test purchase
6. Refresh analytics dashboard

### **3. Verify Data Appears**

- ✅ Total Clicks should increase by 1
- ✅ "test_source" should appear in source chart
- ✅ "test_campaign" should appear in campaigns list
- ✅ After purchase: Total Orders +1, Revenue increases

---

## Customization

### **Add More Metrics**

To add new metrics to the top cards:

```tsx
<MetricCard
  label="New Metric"
  value={calculatedValue}
  subtitle="Description"
/>
```

### **Change Chart Display**

To show more/fewer sources in the chart:

```tsx
const topSources = sources.slice(0, 12); // Change from 8 to 12
```

### **Add UTM Content/Term**

To display `utm_content` and `utm_term`:

1. Update hooks to fetch these fields
2. Add new cards or lists to display them
3. Update metrics calculations to include them

---

## Summary

✅ **All data is real** - No mock/placeholder data  
✅ **Real-time updates** - Refresh to see latest metrics  
✅ **Complete UTM tracking** - Source, medium, campaign all displayed  
✅ **Device & Geo analytics** - See where traffic comes from  
✅ **Empty states** - Helpful messages when no data exists  
✅ **Performance optimized** - Top N results, indexed queries  

**The analytics dashboard is now production-ready and shows your actual business metrics!** 🎉
