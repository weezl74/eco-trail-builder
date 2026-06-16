## Goal
Add a parallel "business account" experience for SMEs. Resident UX unchanged except: address removed from registration, and registration page gains an "Is this a business account?" toggle. Business users land in a business-only app with SME-tuned calculator, pledges, sprints, challenges, and a business card that appears in residents' & businesses' Woolly Wallets.

## 1. Database (one migration)
- `profiles`: add `account_type text default 'resident'` (values: `resident` | `business`), drop NOT NULL expectation on `address` (already nullable). No data loss.
- New table `business_cards`:
  - `id uuid pk`, `user_id uuid → auth.users on delete cascade unique`, `business_name text not null`, `tagline text`, `sector text`, `website text`, `phone text`, `address text`, `postcode text`, `latitude numeric`, `longitude numeric`, `logo_url text`, `pen_portrait text`, `climate_goals text`, `offer_to_residents text` (free text — discounts, active travel perks), `offer_to_businesses text` (advice, consultancy), `status text default 'approved'` (auto-approve for now; column lets us add moderation later), `created_at`, `updated_at`.
  - GRANT SELECT to anon+authenticated (cards are public in wallets); INSERT/UPDATE/DELETE to authenticated own row; ALL to service_role.
  - RLS: anyone can SELECT where `status='approved'`; owner can SELECT/INSERT/UPDATE/DELETE their own row.

## 2. Registration changes (resident + business)
- `RegisterForm.tsx`: remove `address` field from form + state; keep `postcode`.
- Add a small "Is this a business account?" toggle (Yes/No) at the top of the form. Default No.
  - If **No** → existing flow (writes `account_type='resident'`).
  - If **Yes** → after Supabase signUp completes, route caller to a new `BusinessOnboarding` stage instead of going straight to the app. Show explanation copy:
    > "Your business card will appear in the Woolly Wallets of residents and other businesses across Caerphilly — helping promote your low-carbon work and reduce supply-chain emissions. Use the free-text fields to offer help: advice, consultancy, discounts for active-travel visits, anything. Submissions are auto-approved for early access; full review takes 1-2 working days. You can use the resident app immediately while you wait."
- `RegistrationDetails` type loses `address`.

## 3. New: BusinessOnboarding form
- `src/components/business/BusinessOnboarding.tsx`. Same orange/black look as `RegisterForm`. Fields: business name, sector (select), tagline, website, phone, address, postcode, climate_goals, pen_portrait, offer_to_residents, offer_to_businesses. Submit → upsert to `business_cards` + set `profiles.account_type='business'` → advance to BusinessApp.

## 4. Routing in `Index.tsx`
- Add stages: `business-onboarding`, `business-app`.
- On login/register success: read `profiles.account_type`. If `business` → `business-app`; else `app`.
- After RegisterForm completes with business toggle = Yes → `business-onboarding`. After onboarding → `business-app`.

## 5. New: BusinessApp shell (business-only UI)
- `src/components/business/BusinessApp.tsx`, mirrors `SimplifiedApp` structure.
- Tabs (reuses `BottomNavigation` styling, business-flavoured labels):
  - **Home** — SME home (intro, current SME footprint, quick links to calculator + pledges).
  - **Calculator** — wraps existing `BusinessCarbonReport` (already in repo, SME mode).
  - **Actions** — SME pledges + sprints + challenges (see §6).
  - **Community** — reuse `BusinessCommunity` + `BusinessCommunityPledges` (existing).
  - **Account** — business profile/card editor + sign-out. Reuses `BusinessProfile` and links to "Edit my card" (re-opens BusinessOnboarding in edit mode).

## 6. SME pledges / sprints / challenges
- New `src/data/businessActions.ts` with SME-tagged lists (same shape as resident equivalents) covering: switch to renewable tariff, fleet EV pilot, supplier engagement, waste audit, cycle-to-work, hybrid working policy, LED retrofit, energy monitoring, local sourcing, packaging reduction, staff carbon literacy, scope-3 disclosure sprint, etc. Tone matches resident side (warm, sheep-themed nudges).
- New `BusinessPledgesScreen`, `BusinessSprintsScreen`, `BusinessChallengesScreen` — clones of the resident screens but reading from `businessActions.ts`. Resident screens unchanged.

## 7. Woolly Wallet business card
- Existing `WoollyWallet` gets a new card type "Business spotlight" that pulls approved rows from `business_cards` and renders a swipeable stack (one card per business). Card front: logo/name/tagline/sector; back: offers to residents/businesses + website/phone. Same flip animation language as the member card.
- Shown to both residents and businesses.

## 8. Auth defaults
- Keep email/password. No address required. `account_type` derived from registration toggle. Auto-confirm off (existing behaviour).

## Technical notes
- All new files under `src/components/business/` and `src/data/`.
- No edits to `BusinessCarbonReport.tsx` itself — wrap it.
- `useAuth` unchanged; add small `useAccountType` hook that selects `profiles.account_type`.
- All copy goes through `useTranslations` so Welsh works.
- No new secrets, no edge functions, no payment, no admin UI.

## Out of scope (flagged for later)
- Real moderation queue / admin role (column exists, default 'approved' for now).
- Business→resident toggle inside one account (business-only as agreed).
- Business analytics dashboard.

```text
Index
 ├─ resident path  → RegisterForm (no addr) → SimplifiedApp
 └─ business path  → RegisterForm (toggle Yes) → BusinessOnboarding → BusinessApp
                                                       │
                                                       └─ writes business_cards
                                                              │
                                                              └─ shown in WoollyWallet (both audiences)
```
