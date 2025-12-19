# Testing Protocol

## Test Session: Admin Users & Member Profile

### Features to Test:
1. Admin user management page (/admin/users)
2. Create admin/member users
3. Promote/Demote users
4. Delete users
5. Member profile page (/member/profile)
6. Edit profile fields
7. Change password
8. Upload/change profile photo

### Test Credentials:
- Admin: admin@academie-levinet.com / Admin2025!
- Member: test@academie-levinet.com / test123

### Routes to Test:
- /admin/users
- /member/profile

### Backend Endpoints to Test:
- GET /api/admin/users
- POST /api/admin/users
- PUT /api/admin/users/{id}/role
- DELETE /api/admin/users/{id}
- GET /api/profile
- PUT /api/profile
- PUT /api/profile/password
- POST /api/profile/photo

### Tests Passed:
- Admin users page loads ✓
- Create user modal displays ✓
- Users list with filters (Tous, Admins, Membres) ✓
- Member profile page loads ✓
- Profile edit mode works ✓
- All profile fields editable ✓

### Incorporate User Feedback:
- Admin can create admin accounts for bureau management
- Users can update their profile and photo

