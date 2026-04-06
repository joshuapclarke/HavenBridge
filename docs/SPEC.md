# HavenBridge — Design Spec

## Overview
HavenBridge is a nonprofit platform that connects case workers and donors to improve outcomes for vulnerable children in the Philippines. The system tracks resident progress across 9 safehouses, enables case management for social workers, and shows donors measurable impact.

---

## Implementation Status

| Feature | Status | Route / Location |
|---------|--------|------------------|
| Public landing page | Done | `/welcome` |
| Public impact dashboard | Done | `/impact` |
| Staff login + auth guard | Done | `/login` |
| Privacy policy + cookie consent | Done | `/privacy` |
| Staff overview dashboard | Done | `/` |
| Resident case dashboard (3-panel) | Done | `/cases` |
| Donor management dashboard | Done | `/donors` |
| Reports & analytics | Done | `/reports` |
| Admin portal (quick actions) | Done | `/admin` |
| Donor portal (external) | Done | `/donor-portal` |
| Search & filter on caseload | Done | Resident sidebar |
| Add Session / Visit / Donation forms | Done | Modal forms |
| CSV data importer (7,000+ rows) | Done | Startup import |
| Real database (17 tables, SQLite) | Done | `havenbridge.db` |
| Sign out | Done | Nav bar |

---

## Tech Stack
- **Backend:** ASP.NET Core 10 Web API
- **Frontend:** React 19 + Vite + TypeScript
- **Styling:** Tailwind CSS 4 with custom haven-* color palette
- **Database:** SQLite via Entity Framework Core
- **Data:** 17 CSV seed files (~7,000 rows) imported at startup

---

## Core Users

### 1. Case Worker (Primary Operator)
- Manages residents
- Logs sessions, visits, notes
- Monitors alerts/regressions
- Needs fast, simple workflows

### 2. Donor (External Portal User)
- Views personal giving history
- Sees impact of donations
- Manages recurring giving and preferences
- Needs trust, transparency, simplicity

### 3. Admin / Staff
- Data entry
- System updates
- Non-technical, needs clarity

---

## Core Features (MVP)

### Resident Management
- Profile: name, age, intake date, location
- Status tracking (green/yellow/red)
- Timeline of progress

### Case Logging
- Session notes
- Home visits
- Health / education tracking

### Alerts System
- Flags for regression
- Highlight urgent cases

### Donor Management
- Donor profiles
- Giving history
- Status (active / at-risk)

### Impact Visibility
- Show how donations map to outcomes

---

## Screens (Implemented)

### Public Pages

**Landing Page** (`/welcome`)
- Hero: gradient banner, headline, CTAs → See Our Impact / Staff Login
- Mission: 3 feature cards (Case Management, Donor Transparency, Measurable Impact)
- Stats: live counts from the API (residents, sessions, safehouses, donations)
- Footer with branding

**Impact Dashboard** (`/impact`)
- Summary cards with anonymized aggregate data
- Published impact snapshots as date-stamped cards
- No login required — designed for public trust

**Login** (`/login`)
- Centered card with logo, email/password fields
- Stores auth flag in localStorage, redirects to staff dashboard

**Privacy Policy** (`/privacy`)
- 7-section policy covering data collection, protection, cookies, rights

### Staff Pages (login required)

**Screen 1 — Overview Dashboard** (`/`)
- Summary cards: active residents, sessions, safehouses, donations
- Recent activity feed
- Quick action buttons

**Screen 2 — Resident Case Dashboard** (`/cases`)
- Left sidebar: searchable, filterable resident list (by status, risk level)
- Main panel: resident profile header + tabbed content
  - Tabs: Counseling Sessions | Health | Education | Home Visits | Case Notes
  - Add Session and Add Visit modal forms
- Right sidebar: alerts (high risk, flagged sessions, unresolved incidents)

**Screen 3 — Donor Management** (`/donors`)
- Summary cards: total donors, active, at-risk, avg gift size
- Donor table with click-to-select
- Detail panel: contact info, giving history, impact summary
- Add Donation modal form

**Screen 4 — Reports & Analytics** (`/reports`)
- Safehouse comparison table with visual occupancy bars
- Donor overview cards
- Alert summary (color-coded counts)

**Screen 5 — Admin Portal** (`/admin`)
- Search bar
- Large action buttons: Add Resident, Log Session, Record Visit, Add Donor
- Recent activity feed

**Screen 6 — Donor Portal** (`/donor-portal`)
- Welcome card: donor name, lifetime giving, last donation, recurring status
- Impact section: anonymized stories, programs supported
- Giving history table
- Profile/settings section

---

## Design Principles
- Low cognitive load
- Fast data entry
- Clear hierarchy
- Trust + transparency for donors
- Accessibility for non-technical users

---

## UX Notes
- Use dashboards over deep navigation
- Prioritize visibility of status + alerts
- Keep workflows under 3 clicks where possible
- Use tables for data, cards for summaries

---

## Data Model (Simplified)

Resident:
- id
- name
- age
- intake_date
- location
- status

Session:
- id
- resident_id
- type (counseling, visit, etc)
- notes
- date

Donor:
- id
- name
- total_given
- last_gift_date
- status

---

## Goal
Build a simple, dashboard-driven web app that:
- Improves case worker efficiency
- Tracks resident progress clearly
- Gives donors visible impact of contributions


---

## Full ERD (Authoritative Data Model)

```mermaid
erDiagram
  SAFEHOUSES {
    int safehouse_id PK
    string safehouse_code
    string name
    string region
    string city
    string province
    string country
    date open_date
    string status
    int capacity_girls
    int capacity_staff
    int current_occupancy
    string notes
  }
  RESIDENTS {
    int resident_id PK
    int safehouse_id FK
    string case_control_no
    string internal_code
    string case_status
    string sex
    date date_of_birth
    string birth_status
    string place_of_birth
    string religion
    string case_category
    boolean sub_cat_orphaned
    boolean sub_cat_trafficked
    boolean sub_cat_child_labor
    boolean sub_cat_physical_abuse
    boolean sub_cat_sexual_abuse
    boolean sub_cat_osaec
    boolean sub_cat_cicl
    boolean sub_cat_at_risk
    boolean sub_cat_street_child
    boolean sub_cat_child_with_hiv
    boolean is_pwd
    string pwd_type
    boolean has_special_needs
    string special_needs_diagnosis
    boolean family_is_4ps
    boolean family_solo_parent
    boolean family_indigenous
    boolean family_parent_pwd
    boolean family_informal_settler
    string referral_source
    string referring_agency_person
    string assigned_social_worker
    string initial_case_assessment
    string reintegration_type
    string reintegration_status
    string initial_risk_level
    string current_risk_level
    string age_upon_admission
    string present_age
    string length_of_stay
    date date_colb_registered
    date date_colb_obtained
    date date_case_study_prepared
    date date_of_admission
    date date_enrolled
    date date_closed
    datetime created_at
    boolean notes_restricted
  }
  PROCESS_RECORDINGS {
    int recording_id PK
    int resident_id FK
    date session_date
    string social_worker
    string session_type
    int session_duration_minutes
    string emotional_state_observed
    string emotional_state_end
    string session_narrative
    string interventions_applied
    string follow_up_actions
    boolean progress_noted
    boolean concerns_flagged
    boolean referral_made
    boolean notes_restricted
  }
  INTERVENTION_PLANS {
    int plan_id PK
    int resident_id FK
    string plan_category
    string plan_description
    string services_provided
    float target_value
    date target_date
    string status
    date case_conference_date
    datetime created_at
    datetime updated_at
  }
  HOME_VISITATIONS {
    int visitation_id PK
    int resident_id FK
    date visit_date
    string social_worker
    string visit_type
    string location_visited
    string family_members_present
    string purpose
    string observations
    string family_cooperation_level
    boolean safety_concerns_noted
    boolean follow_up_needed
    string follow_up_notes
    string visit_outcome
  }
  HEALTH_WELLBEING_RECORDS {
    int health_record_id PK
    int resident_id FK
    date record_date
    float general_health_score
    float nutrition_score
    float sleep_quality_score
    float energy_level_score
    float height_cm
    float weight_kg
    float bmi
    boolean medical_checkup_done
    boolean dental_checkup_done
    boolean psychological_checkup_done
    string notes
  }
  EDUCATION_RECORDS {
    int education_record_id PK
    int resident_id FK
    date record_date
    string education_level
    string school_name
    string enrollment_status
    float attendance_rate
    float progress_percent
    string completion_status
    string notes
  }
  INCIDENT_REPORTS {
    int incident_id PK
    int resident_id FK
    int safehouse_id FK
    date incident_date
    string incident_type
    string severity
    string description
    string response_taken
    boolean resolved
    date resolution_date
    string reported_by
    boolean follow_up_required
  }
  SUPPORTERS {
    int supporter_id PK
    string supporter_type
    string display_name
    string organization_name
    string first_name
    string last_name
    string relationship_type
    string region
    string country
    string email
    string phone
    string status
    datetime created_at
    date first_donation_date
    string acquisition_channel
  }
  DONATIONS {
    int donation_id PK
    int supporter_id FK
    string donation_type
    date donation_date
    boolean is_recurring
    string campaign_name
    string channel_source
    string currency_code
    float amount
    float estimated_value
    string impact_unit
    string notes
    int referral_post_id
  }
  DONATION_ALLOCATIONS {
    int allocation_id PK
    int donation_id FK
    int safehouse_id FK
    string program_area
    float amount_allocated
    date allocation_date
    string allocation_notes
  }
  IN_KIND_DONATION_ITEMS {
    int item_id PK
    int donation_id FK
    string item_name
    string item_category
    int quantity
    string unit_of_measure
    float estimated_unit_value
    string intended_use
    string received_condition
  }
  PARTNERS {
    int partner_id PK
    string partner_name
    string partner_type
    string role_type
    string contact_name
    string email
    string phone
    string region
    string status
    date start_date
    date end_date
    string notes
  }
  PARTNER_ASSIGNMENTS {
    int assignment_id PK
    int partner_id FK
    int safehouse_id FK
    string program_area
    date assignment_start
    date assignment_end
    string responsibility_notes
    boolean is_primary
    string status
  }
  SAFEHOUSE_MONTHLY_METRICS {
    int metric_id PK
    int safehouse_id FK
    date month_start
    date month_end
    int active_residents
    float avg_education_progress
    float avg_health_score
    int process_recording_count
    int home_visitation_count
    int incident_count
    string notes
  }
  SOCIAL_MEDIA_POSTS {
    int post_id PK
    string platform
    string platform_post_id
    string post_url
    datetime created_at
    string day_of_week
    int post_hour
    string post_type
    string media_type
    string caption
    string hashtags
    int num_hashtags
    int mentions_count
    boolean has_call_to_action
    string call_to_action_type
    string content_topic
    string sentiment_tone
    int caption_length
    boolean features_resident_story
    string campaign_name
    boolean is_boosted
    float boost_budget_php
    int impressions
    int reach
    int likes
    int comments
    int shares
    int saves
    int click_throughs
    int video_views
    float engagement_rate
    int profile_visits
    int donation_referrals
    float estimated_donation_value_php
    int follower_count_at_post
    float watch_time_seconds
    float avg_view_duration_seconds
    int subscriber_count_at_post
    int forwards
  }
  PUBLIC_IMPACT_SNAPSHOTS {
    int snapshot_id PK
    date snapshot_date
    string headline
    string summary_text
    string metric_payload_json
    boolean is_published
    datetime published_at
  }

  SAFEHOUSES ||--o{ RESIDENTS : houses
  SAFEHOUSES ||--o{ INCIDENT_REPORTS : has
  SAFEHOUSES ||--o{ DONATION_ALLOCATIONS : receives
  SAFEHOUSES ||--o{ PARTNER_ASSIGNMENTS : has
  SAFEHOUSES ||--o{ SAFEHOUSE_MONTHLY_METRICS : tracks
  RESIDENTS ||--o{ PROCESS_RECORDINGS : has
  RESIDENTS ||--o{ INTERVENTION_PLANS : has
  RESIDENTS ||--o{ HOME_VISITATIONS : has
  RESIDENTS ||--o{ HEALTH_WELLBEING_RECORDS : has
  RESIDENTS ||--o{ EDUCATION_RECORDS : has
  RESIDENTS ||--o{ INCIDENT_REPORTS : involved_in
  SUPPORTERS ||--o{ DONATIONS : makes
  DONATIONS ||--o{ DONATION_ALLOCATIONS : split_into
  DONATIONS ||--o{ IN_KIND_DONATION_ITEMS : contains
  PARTNERS ||--o{ PARTNER_ASSIGNMENTS : assigned_via
```