# Testing Protocol

## Test Session: Onboarding Flow with Stripe Payment

### Features to Test:
1. Multi-step onboarding form (5 steps)
2. User registration through onboarding
3. Lead creation with training preferences
4. Stripe checkout session creation for €35 license
5. Redirect to payment success page
6. User role assignment (member by default)

### Test Credentials:
- Member Email: membre@academie-levinet.com
- Member Password: Membre2025!
- Admin Email: admin@academie-levinet.com
- Admin Password: Admin2025!
- Test Member: test@academie-levinet.com / test123

### Routes to Test:
- /onboarding (all 5 steps)
- /payment/success
- /payment/cancel
- /member/dashboard

### Backend Endpoints to Test:
- POST /api/auth/register
- POST /api/leads
- POST /api/payments/membership/checkout
- GET /api/payments/status/{session_id}

### Known Issues:
- FIXED: Lead API field names now match frontend (person_type, full_name, phone, city, country)
- FIXED: Added training_mode and nearest_club_city to Lead model
- FIXED: New users now have 'member' role by default (not 'admin')
- FIXED: Webhook uses has_paid_license field consistently

### Tests Passed:
- Onboarding Step 1 (Profile selection) ✓
- Onboarding Step 2 (Motivations) ✓
- Onboarding Step 3 (Training mode) ✓
- Onboarding Step 4 (Account creation form) ✓
- Onboarding Step 5 (License payment) ✓
- Backend: Register API ✓
- Backend: Leads API ✓
- Backend: Stripe checkout API ✓

### Incorporate User Feedback:
- Complete onboarding flow with €35 license payment integration

