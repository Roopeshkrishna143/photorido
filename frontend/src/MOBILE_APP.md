# Photorido Mobile Application

## Overview
A fully-featured mobile application for the Photorido photographer search portal, designed following iOS Human Interface Guidelines with Android dimensions (375px × 812px).

## Features

### 📱 Device Simulation
- **iPhone Frame**: Realistic iPhone mockup with notch and rounded corners
- **Status Bar**: Displays time (9:41), signal strength, and battery
- **Home Indicator**: iOS-style home gesture bar
- **Safe Areas**: Proper handling of notch and bottom safe areas

### 🎨 Design System
- **iOS UI Guidelines**: Follows Apple's Human Interface Guidelines
- **Blue Theme**: Consistent with Photorido's brand colors
- **Typography**: iOS-style large titles, SF-like font sizing
- **Components**: Native-feeling cards, buttons, and navigation

### 🏠 Home Screen
- **Large Title Navigation**: iOS-style large title "Discover"
- **Search Bar**: Location-based search with icon
- **Category Grid**: 6 service categories with emoji icons
- **Featured Section**: Horizontal scrolling carousel
- **Recommended List**: Vertical scrolling photographer cards
- **Ratings & Pricing**: Star ratings and pricing in INR

### 🔍 Search Screen
- **Search Input**: Real-time search with clear button
- **Filter Toggle**: iOS-style filter button with active state
- **Category Pills**: Horizontal scrolling filter chips
- **Results Count**: Dynamic results counter
- **List View**: Detailed photographer cards with images

### 🧭 Explore Screen
- **Service Cards**: 6 creative services with gradient backgrounds
- **Professional Count**: Shows number of professionals per service
- **Location Grid**: Popular cities with beautiful imagery
- **Geographic Coverage**: Global locations showcase

### ❤️ Favorites Screen
- **Saved Items**: User's favorited photographers
- **Empty State**: Helpful messaging when no favorites exist
- **Quick Access**: Easy viewing of saved professionals
- **Heart Animation**: iOS-style fill animation

### 👤 Profile Screen
- **Header Design**: Gradient background with user avatar
- **Menu Sections**: Organized into Account, Preferences, Support
- **Settings Cards**: iOS-style grouped table view
- **Badges**: Notification badges on menu items
- **Action Icons**: Consistent iconography throughout

### 📸 Photographer Details
- **Hero Image**: Full-width photographer image
- **Navigation**: Back, favorite, and share buttons
- **Quick Stats**: Experience, location, languages at a glance
- **About Section**: Professional biography
- **Services Tags**: Pill-style service offerings
- **Tabs**: Portfolio and Reviews with iOS-style segmented control
- **Portfolio Grid**: 2-column image gallery
- **Reviews List**: User reviews with ratings
- **Bottom Actions**: Message and Book Now CTAs

### 🎯 Bottom Navigation
- **5 Tabs**: Home, Search, Explore, Saved, Profile
- **Active States**: Filled icons for active tab
- **Smooth Transitions**: Tab switching animations
- **Label Text**: Clear tab labels
- **Icon Design**: Lucide React icons matching iOS style

## iOS Design Patterns

### Typography
- **Large Titles**: 34px bold for main screens
- **Headings**: 22px semibold for sections
- **Body Text**: 17px for primary content
- **Captions**: 15px and 13px for secondary info

### Spacing
- **Screen Padding**: 16px (4 in Tailwind)
- **Component Gaps**: 12px, 16px, 20px
- **Safe Areas**: Top 44px, Bottom 80px

### Interactions
- **Active States**: Scale down to 95-98%
- **Haptic Feedback**: Visual scale transforms
- **Smooth Transitions**: All state changes animated
- **Pull to Refresh**: Visual affordance (ready for implementation)

### Colors
- **Primary Blue**: #3b82f6 (blue-600)
- **Background**: #f2f2f7 (iOS system background)
- **Cards**: White with subtle borders
- **Text Hierarchy**: Gray scale from 900 to 500

### Components
- **Rounded Corners**: 12px, 16px, 20px, 24px
- **Shadow System**: Subtle elevations
- **Blur Effects**: Backdrop blur for glass morphism
- **Badges**: Rounded pills for tags and counts

## Technical Implementation

### Component Structure
```
/components/mobile/
├── MobileApp.tsx              # Main container with device frame
├── MobileBottomNav.tsx        # iOS-style tab bar
├── MobileHome.tsx             # Home screen
├── MobileSearch.tsx           # Search functionality
├── MobileExplore.tsx          # Services and locations
├── MobileFavorites.tsx        # Saved photographers
├── MobileProfile.tsx          # User profile and settings
└── MobilePhotographerDetails.tsx  # Photographer profile view
```

### State Management
- Local state for navigation
- Tab switching
- Detail view routing
- Favorite toggling
- Search and filtering

### Responsive Design
- Fixed dimensions: 375px × 812px
- Optimized for iPhone X/11/12/13
- Portrait orientation
- Safe area handling

## User Experience

### Navigation Flow
1. **Entry Point**: Floating button on desktop home page
2. **Home Screen**: Default landing with featured content
3. **Bottom Tabs**: Quick access to all sections
4. **Detail Views**: Slide in from right
5. **Back Navigation**: iOS-style back button
6. **Exit**: Close button returns to desktop

### Key Interactions
- **Tap**: Primary action (select, navigate)
- **Scroll**: Vertical and horizontal browsing
- **Search**: Real-time filtering
- **Filter**: Category and criteria selection
- **Favorite**: Toggle save state
- **Share**: Social sharing (ready for implementation)
- **Book**: Call-to-action for bookings

## Future Enhancements

### Planned Features
- [ ] Pull to refresh functionality
- [ ] Infinite scroll loading
- [ ] Image lightbox/zoom
- [ ] Video portfolio support
- [ ] In-app messaging
- [ ] Calendar booking integration
- [ ] Push notifications UI
- [ ] Dark mode support
- [ ] Accessibility improvements
- [ ] Animation library integration (Motion)
- [ ] Gesture controls (swipe back)
- [ ] Search history
- [ ] Recent searches
- [ ] Location permissions UI
- [ ] Payment integration mockup

## Access

Click the floating **smartphone icon** in the bottom-right corner of the desktop home page to launch the mobile application preview.

## Design Philosophy

The mobile app follows iOS Human Interface Guidelines to create a familiar, intuitive experience for users. Every interaction, animation, and visual element is crafted to feel native to iOS while maintaining Photorido's brand identity through the blue color scheme and professional aesthetic.
