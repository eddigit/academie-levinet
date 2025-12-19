# Testing Protocol

## Test Session: Existing Members Validation Flow

### Features to Test:
1. "Je suis déjà membre" button on Step 5
2. Existing member form (city, club, instructor, grade)
3. Pending member creation API
4. Admin page: Pending Members list
5. Admin page: Settings/SMTP configuration
6. Approve/Reject pending members
7. Email with temporary password on approval

### Test Credentials:
- Admin Email: admin@academie-levinet.com
- Admin Password: Admin2025!

### Routes to Test:
- /onboarding (step 5 with "Je suis déjà membre" button)
- /admin/pending-members
- /admin/settings

### Backend Endpoints to Test:
- POST /api/pending-members
- GET /api/admin/pending-members
- POST /api/admin/pending-members/{id}/approve
- POST /api/admin/pending-members/{id}/reject
- GET /api/admin/settings/smtp
- PUT /api/admin/settings/smtp
- GET /api/instructors

### Tests Passed:
- "Je suis déjà membre" button visible ✓
- Existing member form displayed ✓
- Pending member creation API ✓
- Admin pending members page loads ✓
- Admin settings page loads ✓
- Member approval creates user account ✓
- Grades list includes Instructeur, Directeur Technique, Directeur National ✓

### Incorporate User Feedback:
- Complete flow for existing members who already paid their license in club

