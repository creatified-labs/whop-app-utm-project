# UTM Attribution Flow - Setup Complete ✅

## What Was Done

### 1. Database Schema Updates ✅
- **Updated `lib/db/schema.ts`** with enhanced UTM tracking fields:
  - Added to `advancedLinkOrders`: `whopOrderId`, `utmContent`, `utmTerm`, `sessionToken`, `deviceType`, `browser`, `countryCode`
  - Added to `advancedLinkSessions`: `utmContent`, `utmTerm`, `ipHash`, `referrer`, `userAgent`, `updatedAt`

### 2. Database Migration Created ✅
- **Created `drizzle/0004_add_enhanced_utm_tracking.sql`**
  - Adds all missing UTM fields to both tables
  - Creates indexes for better query performance on `session_token`, `utm_source`, `whop_order_id`, `clicked_at`, and `advanced_link_id`

### 3. Click Tracking Route Updated ✅
- **Updated `/app/t/[slug]/route.ts`**
  - Now captures and stores: `utmContent`, `utmTerm`, `ipHash`, `referrer`, `userAgent`
  - Creates session records with complete device and UTM data
  - Sets `utm_session` cookie (7-day expiry, httpOnly, secure in production)
  - Enhanced logging for debugging

### 4. Checkout API Enhanced ✅
- **Updated `/app/api/create-whop-checkout/route.ts`**
  - Accepts `utm_content` and `utm_term` in metadata
  - Passes all 5 UTM parameters to Whop checkout API
  - Includes `session_token` for attribution
  - Comprehensive logging of metadata

### 5. Webhook Handler Fixed ✅
- **Updated `/app/api/webhooks/route.ts`**
  - Extracts all UTM fields: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
  - Captures `whopOrderId` from payment events
  - Saves complete order data with UTM attribution
  - Updates session `convertedAt` timestamp when purchase completes
  - Fixed `sessionId` → `sessionToken` field name

### 6. Dependencies Installed ✅
- `ua-parser-js@2.0.7` - Already installed
- `@types/ua-parser-js@0.7.39` - Added
- `postgres@3.4.7` - Already installed
- `qrcode@1.5.4` - Already installed

---

## Next Steps: Run the Migration

### Option 1: Using psql (Recommended)
```bash
# Set your database URL
export SUPABASE_DB_URL="your-supabase-connection-string"

# Run the migration
psql "$SUPABASE_DB_URL" < drizzle/0004_add_enhanced_utm_tracking.sql
```

### Option 2: Using Drizzle Kit
```bash
# Push schema changes to database
pnpm drizzle-kit push:pg
```

### Option 3: Manual via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `drizzle/0004_add_enhanced_utm_tracking.sql`
4. Paste and execute

---

## Testing the Complete Flow

### 1. Create a Test Link
```bash
# In your app, create an advanced tracking link with:
- Name: "Test Twitter Campaign"
- utm_source: "twitter"
- utm_medium: "social"
- utm_campaign: "winter_sale"
- Destination: Your Whop checkout URL
```

### 2. Click the Link
```bash
# Visit: https://your-app.vercel.app/t/your-slug
# This should:
# - Create a session in advanced_link_sessions
# - Set utm_session cookie
# - Redirect to destination
```

### 3. Verify Session Created
```sql
SELECT 
  session_token,
  utm_source,
  utm_medium,
  utm_campaign,
  device_type,
  browser,
  os,
  country_code,
  clicked_at
FROM advanced_link_sessions 
ORDER BY created_at DESC 
LIMIT 1;
```

Expected result: Should show your session with UTM data and device info.

### 4. Check Cookie
Open browser DevTools → Application → Cookies
Look for: `utm_session` cookie with your session token

### 5. Complete a Test Purchase
- Use Whop test mode
- Complete checkout
- Wait for webhook to fire

### 6. Verify Order Attribution
```sql
SELECT 
  whop_order_id,
  advanced_link_id,
  utm_source,
  utm_medium,
  utm_campaign,
  utm_content,
  utm_term,
  session_token,
  amount_cents,
  whop_user_id,
  created_at
FROM advanced_link_orders 
ORDER BY created_at DESC 
LIMIT 1;
```

Expected result: Should show order with all UTM fields populated.

### 7. Verify Session Conversion
```sql
SELECT 
  session_token,
  clicked_at,
  converted_at
FROM advanced_link_sessions 
WHERE session_token = 'your-session-token-here';
```

Expected result: `converted_at` should have a timestamp.

---

## Analytics Queries

### Revenue by UTM Source
```sql
SELECT 
  utm_source,
  COUNT(*) as orders,
  SUM(amount_cents)/100 as revenue_usd,
  AVG(amount_cents)/100 as avg_order_value
FROM advanced_link_orders
WHERE utm_source IS NOT NULL
GROUP BY utm_source
ORDER BY revenue_usd DESC;
```

### Conversion Rate by Campaign
```sql
SELECT 
  s.utm_campaign,
  COUNT(DISTINCT s.session_token) as clicks,
  COUNT(DISTINCT o.session_token) as conversions,
  ROUND(
    COUNT(DISTINCT o.session_token)::numeric / 
    NULLIF(COUNT(DISTINCT s.session_token), 0) * 100, 
    2
  ) as conversion_rate_pct
FROM advanced_link_sessions s
LEFT JOIN advanced_link_orders o ON s.session_token = o.session_token
WHERE s.utm_campaign IS NOT NULL
GROUP BY s.utm_campaign
ORDER BY conversion_rate_pct DESC;
```

### Device Performance
```sql
SELECT 
  s.device_type,
  s.browser,
  COUNT(DISTINCT s.session_token) as clicks,
  COUNT(DISTINCT o.id) as orders,
  SUM(o.amount_cents)/100 as revenue_usd
FROM advanced_link_sessions s
LEFT JOIN advanced_link_orders o ON s.session_token = o.session_token
GROUP BY s.device_type, s.browser
ORDER BY revenue_usd DESC;
```

---

## Troubleshooting

### Issue: Session not created
**Check:**
- Database connection in `/app/t/[slug]/route.ts`
- Console logs: `[t/[slug]] Session created:`
- Verify `SUPABASE_DB_URL` env var is set

### Issue: Cookie not set
**Check:**
- Browser console for cookie
- Ensure `secure: true` only in production
- Check `sameSite` setting (should be 'lax' or 'none')

### Issue: Webhook not receiving UTM data
**Check:**
- `/app/api/create-whop-checkout/route.ts` logs
- Whop webhook payload in console
- Metadata being passed to Whop API

### Issue: Order created but no UTM data
**Check:**
- Webhook payload structure
- `extractMetadata()` function in webhook handler
- Whop checkout session metadata

---

## Environment Variables Required

```bash
# Whop API Keys
WHOP_API_KEY=apik_xxx
WHOP_APP_API_KEY=apik_xxx
NEXT_PUBLIC_WHOP_APP_ID=app_xxx

# Database
SUPABASE_DB_URL=postgresql://...

# Optional
WHOP_WEBHOOK_SECRET=xxx
WHOP_COMPANY_ID=biz_xxx
```

---

## Success Criteria ✅

After completing setup and testing, you should be able to:

1. ✅ Click a tracking link → See session in database with UTM data
2. ✅ See `utm_session` cookie in browser
3. ✅ Complete purchase → See order in database with UTM attribution
4. ✅ Query analytics by UTM source/medium/campaign
5. ✅ Track conversion rates per campaign
6. ✅ Analyze device/browser performance

---

## Files Modified

- ✅ `lib/db/schema.ts` - Schema definitions
- ✅ `drizzle/0004_add_enhanced_utm_tracking.sql` - Migration
- ✅ `app/t/[slug]/route.ts` - Click tracking
- ✅ `app/api/create-whop-checkout/route.ts` - Checkout creation
- ✅ `app/api/webhooks/route.ts` - Webhook handler
- ✅ `package.json` - Dependencies

---

## What's Next?

1. **Run the migration** (see instructions above)
2. **Test the flow** end-to-end
3. **Verify data** in database
4. **Build analytics dashboards** using the queries above
5. **Monitor webhook logs** for any issues

---

## Support

If you encounter issues:
1. Check console logs in `/app/t/[slug]/route.ts`
2. Check webhook logs in `/app/api/webhooks/route.ts`
3. Verify database schema matches expected structure
4. Test with Whop test mode first before production

---

**Status: Implementation Complete ✅**
**Ready for: Migration → Testing → Production**
