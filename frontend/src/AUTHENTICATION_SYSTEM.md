# Photorido Authentication & Role-Based System

## Overview
Photorido implements a comprehensive authentication and role-based access control system with three distinct user roles: **Admin**, **Vendor (Service Provider)**, and **Consumer (End User)**.

## User Roles

### 1. Admin
- Platform administrator with full access
- Manages vendors and consumers
- Access to all system features
- Can moderate content and reviews

### 2. Vendor (Service Provider)
- Professional photographers and creative service providers
- Must complete profile before receiving bookings
- Access to vendor dashboard with calendar management
- Can view bookings, reviews, and earnings
- Profile visible to consumers for booking

### 3. Consumer (End User)
- Regular users looking to book services
- Can search, favorite, and book professionals
- Access to consumer dashboard
- Can leave reviews after service completion
- Manage bookings and payment information

## Authentication Features

### Registration & Login
- **Dual Registration**: Separate flows for Consumers and Vendors
- **Email/Password**: Traditional authentication
- **Google OAuth**: One-click social login
- **Role Selection**: Users choose their role during registration
- **Profile Completion**: Vendors must complete professional profile

### Security
- Password validation (minimum 6 characters)
- Email verification (mock implementation)
- Session management via localStorage
- Protected routes based on user role

## User Flows

### Consumer Flow
1. **Registration/Login** → Choose "User" role
2. **Browse Professionals** → Search by location, date, service
3. **View Profiles** → Check portfolios, reviews, pricing
4. **Book Service** → Select date (half-day/full-day)
5. **Payment** → Mock payment integration
6. **Calendar Block** → Date automatically blocked after payment
7. **Leave Review** → Rate professional after service completion

### Vendor Flow
1. **Registration/Login** → Choose "Professional" role
2. **Complete Profile** → Business details, specialty, pricing, portfolio
3. **Dashboard Access** → View bookings, calendar, earnings
4. **Manage Bookings** → Track upcoming and past events
5. **View Reviews** → Monitor feedback and ratings
6. **Profile Updates** → Edit services, pricing, availability

## Dashboard Features

### Consumer Dashboard
**Bookings Tab**
- View all bookings (confirmed/pending)
- Booking details: date, time, location, event type
- Amount and payment status
- Option to leave review after completion

**Favorites Tab**
- Saved professionals for quick access
- Grid view with key information
- Quick navigation to profiles

**Profile Tab**
- Edit personal information
- Update contact details
- Manage location preferences

**Settings Tab**
- Change password
- Notification preferences (Email/SMS)
- Account management

### Vendor Dashboard
**Overview Tab**
- Statistics cards:
  - Total Bookings
  - Total Earnings (INR)
  - Average Rating
  - Pending Reviews
- Upcoming bookings list
- Recent reviews display

**Calendar Tab**
- View blocked dates
- Booking details with location and event type
- Automatic blocking after payment confirmation
- Cannot manually block dates (controlled by consumer bookings)

**Reviews Tab**
- All customer reviews
- Rating breakdown
- Overall rating display
- Review responses (future feature)

**Profile Tab**
- Business name and specialty
- Years of experience
- Pricing (per day)
- Location and languages
- Bio and services offered
- Portfolio management

**Settings Tab**
- Account information
- Change password
- Notification settings

## Header Navigation

### Structure
```
Logo | Find Professionals | Services | Help | Become a Pro | 🔔 | 👤
```

### Navigation Items
1. **Logo** → Returns to home page
2. **Find Professionals** → Scrolls to search section
3. **Services** → Scrolls to services categories
4. **Help** → Help center (future implementation)
5. **Become a Pro** → Opens vendor registration/login
6. **Notification Bell** → Notifications dropdown (logged in users)
7. **User Icon** → Role-based menu dropdown

### User Menu (Role-Based)
**When Logged Out**
- "Login" button

**When Logged In (Consumer)**
- User name and email
- Role badge: "User"
- Dashboard link
- Settings link
- Logout option

**When Logged In (Vendor)**
- User name and email
- Role badge: "Professional"
- Dashboard link
- Settings link
- Logout option

**When Logged In (Admin)**
- User name and email
- Role badge: "Admin"
- Admin Panel link
- Settings link
- Logout option

## Booking System

### Search Functionality
- **Location-based**: Find professionals in specific cities
- **Date-based**: Check availability on specific dates
- **Service-based**: Filter by photography type
- **Combined Search**: All criteria together

### Availability Logic
```
Professional is available IF:
  - Date is not blocked
  - No confirmed booking exists
  - Payment hasn't been received for that date
```

### Booking Process
1. Consumer searches for date/location
2. Available professionals displayed
3. Consumer selects professional
4. Chooses booking type:
   - Half Day (4 hours) - 50% price
   - Full Day (8+ hours) - Full price
5. Enters event details
6. Proceeds to payment
7. Upon payment confirmation:
   - Booking status: "Confirmed"
   - Calendar date blocked automatically
   - Vendor receives notification
   - Consumer can manage that date

### Calendar Management
- **Blocking controlled by Consumers**: After payment
- **Vendors cannot self-block**: Dates auto-blocked by bookings
- **Half-day bookings**: Can have 2 per day (morning/afternoon)
- **Full-day bookings**: Blocks entire day
- **Booking conflicts**: Prevented at booking stage

## Service Types

### Photography Services
1. **Photographers** - Main service
2. **Video Editors** - Post-production
3. **Album Designers** - Photo album creation
4. **Reel Makers** - Social media content
5. **Photo Frame Makers** - Physical products
6. **Graphic Designers** - Design services

### Future Expansion
- Additional creative services
- Multi-service vendors
- Package deals
- Subscription models

## Rating & Review System

### Consumer Reviews
- **After Service Completion**: Only after booking date passes
- **5-Star Rating**: 1-5 stars
- **Written Review**: Optional comment
- **Photo Uploads**: Share event photos (future)
- **Edit/Delete**: Within 30 days

### Vendor Response
- Can respond to reviews
- Thank customers
- Address concerns professionally

### Rating Display
- Overall rating (average)
- Total number of reviews
- Recent reviews highlighted
- Verified booking badge

## Mobile Application Integration

### Same Authentication
- Login/Register works on mobile
- Role-based dashboards
- Booking management
- Calendar viewing
- Reviews and ratings

### Mobile-Specific Features
- iOS-style navigation
- Bottom tab bar
- Touch-optimized booking flow
- Camera integration for portfolio uploads

## Technical Implementation

### Components
```
/context/
  - AuthContext.tsx          # Authentication context

/components/auth/
  - LoginModal.tsx           # Login/Register modal

/components/dashboards/
  - ConsumerDashboard.tsx    # Consumer dashboard
  - VendorDashboard.tsx      # Vendor dashboard

/components/
  - HeaderNew.tsx            # New header with auth
```

### State Management
- React Context API for auth state
- LocalStorage for session persistence
- Role-based route protection
- Profile completion tracking

### Mock Data
Currently using mock implementations for:
- Authentication API calls
- Payment processing
- Google OAuth
- Email verification

In production, these will connect to:
- Firebase Authentication / Auth0
- Stripe / Razorpay
- Real OAuth providers
- Email service (SendGrid / AWS SES)

## Role-Based Permissions

### Consumer Permissions
✅ Browse all professionals
✅ Search and filter
✅ View profiles and portfolios
✅ Book services
✅ Make payments
✅ Leave reviews
✅ Manage bookings
✅ Save favorites

❌ Cannot create professional profile
❌ Cannot see vendor dashboard
❌ Cannot access booking revenue

### Vendor Permissions
✅ Create/edit professional profile
✅ View bookings and calendar
✅ See earnings and statistics
✅ Read reviews
✅ Update portfolio
✅ Manage services and pricing

❌ Cannot manually block calendar
❌ Cannot delete reviews
❌ Cannot cancel confirmed bookings

### Admin Permissions (Future)
✅ All consumer and vendor permissions
✅ User management
✅ Content moderation
✅ Payment verification
✅ Dispute resolution
✅ Analytics and reporting

## Future Enhancements

### Phase 1 (Authentication)
- [ ] Email verification
- [ ] Password reset flow
- [ ] Two-factor authentication
- [ ] Social login (Facebook, Apple)

### Phase 2 (Booking)
- [ ] Real-time availability
- [ ] Advanced calendar with time slots
- [ ] Booking deposits
- [ ] Cancellation policy
- [ ] Refund management

### Phase 3 (Features)
- [ ] In-app messaging
- [ ] Video calls for consultation
- [ ] Portfolio templates
- [ ] Automated reminders
- [ ] Review verification

### Phase 4 (Business)
- [ ] Subscription plans
- [ ] Featured listings
- [ ] Premium vendor accounts
- [ ] Advertising platform
- [ ] Analytics dashboard

## Security Considerations

### Current Implementation
- Client-side validation
- Role-based UI rendering
- LocalStorage session management

### Production Requirements
- Server-side validation
- JWT tokens
- HTTPS only
- Rate limiting
- XSS protection
- CSRF tokens
- Secure password hashing
- API authentication
- Database encryption

## Best Practices

### For Consumers
1. Complete profile for better communication
2. Book early for popular dates
3. Read reviews before booking
4. Leave honest reviews after service
5. Communicate requirements clearly

### For Vendors
1. Complete professional profile fully
2. Upload high-quality portfolio
3. Respond to bookings promptly
4. Maintain calendar accuracy
5. Provide excellent service for reviews

## Support & Help

### Consumer Support
- Booking assistance
- Payment issues
- Profile management
- Review guidelines
- Dispute resolution

### Vendor Support
- Profile optimization
- Pricing guidance
- Calendar management
- Review best practices
- Technical assistance

## Conclusion

The Photorido authentication system provides a robust foundation for a B2C marketplace connecting creative professionals with clients. The role-based architecture ensures appropriate access and functionality for each user type, while the booking and calendar system enables seamless service delivery.
