# LensHub Design System

## Overview
A modern, professional design system for the LensHub photographer search portal, built with React, Tailwind CSS, and Motion (Framer Motion).

## Design Philosophy
- **Professional & Trustworthy**: Blue color palette to inspire confidence
- **Clean & Modern**: Generous white space, clear hierarchy
- **Engaging**: Smooth animations and micro-interactions
- **Accessible**: High contrast ratios, semantic HTML
- **Responsive**: Mobile-first approach

---

## Color Palette

### Primary Blues
- **Blue 50**: `#eff6ff` - Light backgrounds, subtle accents
- **Blue 100**: `#dbeafe` - Secondary backgrounds
- **Blue 200**: `#bfdbfe` - Borders, dividers
- **Blue 300**: `#93c5fd` - Hover states
- **Blue 400**: `#60a5fa` - Interactive elements
- **Blue 500**: `#3b82f6` - Primary brand color
- **Blue 600**: `#2563eb` - Primary buttons, CTAs
- **Blue 700**: `#1d4ed8` - Hover states for primary
- **Blue 800**: `#1e40af` - Deep accents
- **Blue 900**: `#1e3a8a` - Dark text on light backgrounds

### Neutrals
- **Background**: `#fafbfc` - Page background
- **Foreground**: `#0f172a` - Primary text
- **Muted**: `#f8fafc` - Subtle backgrounds
- **Muted Foreground**: `#64748b` - Secondary text
- **Border**: `#e2e8f0` - Default borders

### Semantic Colors
- **Success**: Green shades for positive actions
- **Warning**: Amber/Yellow for cautions
- **Error**: Red for errors and destructive actions
- **Info**: Blue for informational content

---

## Typography

### Font Hierarchy
- **H1**: 2.5rem (40px), weight 700, letter-spacing -0.02em
- **H2**: 2rem (32px), weight 600, letter-spacing -0.01em
- **H3**: 1.5rem (24px), weight 600
- **H4**: 1.25rem (20px), weight 600
- **Body**: 1rem (16px), weight 400, line-height 1.6
- **Small**: 0.875rem (14px)
- **Tiny**: 0.75rem (12px)

### Font Weights
- **Normal**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

---

## Spacing System

Based on 0.25rem (4px) increments:
- **XS**: 0.25rem (4px)
- **SM**: 0.5rem (8px)
- **MD**: 1rem (16px)
- **LG**: 1.5rem (24px)
- **XL**: 2rem (32px)
- **2XL**: 3rem (48px)
- **3XL**: 4rem (64px)

---

## Border Radius

- **SM**: 0.5rem (8px) - Small elements
- **MD**: 0.75rem (12px) - Default
- **LG**: 1rem (16px) - Cards
- **XL**: 1.5rem (24px) - Large cards
- **2XL**: 2rem (32px) - Hero elements
- **3XL**: 3rem (48px) - Extra large elements
- **Full**: 9999px - Pills and circular elements

---

## Shadows

### Elevation System
- **XS**: `0 1px 2px 0 rgb(0 0 0 / 0.05)` - Subtle lift
- **SM**: `0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)` - Cards at rest
- **MD**: `0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.08)` - Elevated cards
- **LG**: `0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)` - Dropdowns, popovers
- **XL**: `0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.08)` - Modals
- **2XL**: `0 25px 50px -12px rgb(0 0 0 / 0.15)` - Maximum elevation

---

## Glassmorphism

### Glass Effect
- **Background**: `rgba(255, 255, 255, 0.7)`
- **Backdrop Blur**: 12px
- **Border**: `rgba(255, 255, 255, 0.18)`

### Glass Strong
- **Background**: `rgba(255, 255, 255, 0.85)`
- **Backdrop Blur**: 16px
- **Border**: `rgba(255, 255, 255, 0.3)`

**Usage**: Apply `.glass` or `.glass-strong` classes for glassmorphism effects

---

## Gradients

### Primary Gradient
```css
background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
```
**Usage**: Primary buttons, brand elements

### Accent Gradient
```css
background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
```
**Usage**: Secondary buttons, highlights

### Soft Gradient
```css
background: linear-gradient(180deg, #eff6ff 0%, #ffffff 100%);
```
**Usage**: Backgrounds, subtle effects

### Mesh Gradient
```css
background: radial-gradient(at 40% 20%, #dbeafe 0px, transparent 50%),
            radial-gradient(at 80% 0%, #bfdbfe 0px, transparent 50%),
            radial-gradient(at 0% 50%, #eff6ff 0px, transparent 50%);
```
**Usage**: Hero sections, decorative backgrounds

---

## Components

### Buttons

#### Primary Button
- Background: Blue 600 gradient
- Text: White
- Padding: 12px 24px
- Border Radius: 12px
- Hover: Scale 1.05, deeper gradient
- Shadow: Medium on hover

#### Secondary Button
- Background: Transparent
- Border: 2px Blue 200
- Text: Blue 700
- Hover: Background Blue 50, Border Blue 500

#### Ghost Button
- Background: Transparent
- Text: Foreground
- Hover: Background Blue 50

### Cards

#### Standard Card
- Background: White
- Border: 2px Border color
- Border Radius: 24px
- Padding: 24px
- Hover: Border Blue 200, Shadow XL

#### Featured Card
- Background: Gradient white to Blue 50
- Border: 2px transparent
- Border Radius: 24px
- Hover: Border Blue 300, Lift -8px

### Inputs

#### Text Input
- Background: Blue 50
- Border: 2px transparent
- Border Radius: 16px
- Padding: 16px 20px
- Focus: Background White, Border Blue 500, Shadow

---

## Animations

### Durations
- **Fast**: 150ms - Micro-interactions
- **Normal**: 300ms - Standard transitions
- **Slow**: 500ms - Page transitions

### Easing
- **Default**: ease-in-out
- **Sharp**: cubic-bezier(0.4, 0, 0.2, 1)
- **Smooth**: cubic-bezier(0.4, 0, 0.1, 1)

### Common Animations

#### Hover Lift
```jsx
whileHover={{ y: -8 }}
transition={{ duration: 0.3 }}
```

#### Scale on Interaction
```jsx
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
```

#### Fade In
```jsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
```

#### Stagger Children
```jsx
variants={container}
initial="hidden"
whileInView="show"
viewport={{ once: true }}
```

---

## Icons

### Icon Library
**Lucide React** - Consistent, clean icon set

### Sizing
- **Small**: 16px (h-4 w-4)
- **Medium**: 20px (h-5 w-5)
- **Large**: 24px (h-6 w-6)
- **XLarge**: 32px (h-8 w-8)

### Colors
- Primary icons: Blue 600
- Secondary icons: Muted Foreground
- Success: Green 600
- Warning: Amber 600
- Error: Red 600

---

## Layout

### Container
- Max Width: 1280px (container)
- Padding: 16px mobile, 24px tablet, 32px desktop

### Grid System
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3-4 columns
- Gap: 24px standard

### Breakpoints
- **SM**: 640px
- **MD**: 768px
- **LG**: 1024px
- **XL**: 1280px
- **2XL**: 1536px

---

## Best Practices

### Accessibility
- Minimum contrast ratio 4.5:1 for normal text
- Minimum contrast ratio 3:1 for large text
- Focus indicators on all interactive elements
- Semantic HTML structure
- ARIA labels where needed

### Performance
- Use Motion animations sparingly
- Lazy load images
- Optimize images (WebP format)
- Use backdrop-filter with caution (performance)

### Responsive Design
- Mobile-first approach
- Touch-friendly targets (min 44px)
- Readable text sizes on mobile
- Appropriate spacing for different viewports

### Consistency
- Use design tokens from globals.css
- Follow component patterns
- Maintain consistent spacing
- Keep animation durations uniform

---

## Component Library

### Available Components

#### UI Components (Shadcn)
- Alert, Alert Dialog
- Avatar
- Badge
- Button
- Card
- Carousel
- Checkbox
- Dialog, Drawer
- Dropdown Menu
- Form, Input
- Navigation Menu
- Popover
- Select
- Separator
- Sheet, Sidebar
- Skeleton
- Slider, Switch
- Table, Tabs
- Textarea
- Toast (Sonner)
- Tooltip

#### Custom Components
- **Header**: Glassmorphic navigation with animations
- **HeroSearch**: Gradient hero with search functionality
- **ServiceCategories**: Animated service grid
- **PhotographerCard**: Interactive profile cards
- **PhotographerGrid**: Responsive grid layout
- **PhotographerDetails**: Detailed profile page
- **Footer**: Comprehensive footer with newsletter

---

## Usage Examples

### Button with Gradient
```jsx
<Button className="bg-gradient-to-r from-[var(--blue-600)] to-[var(--blue-700)] hover:from-[var(--blue-700)] hover:to-[var(--blue-800)]">
  Click Me
</Button>
```

### Glass Card
```jsx
<div className="glass rounded-3xl p-6">
  Content
</div>
```

### Animated Card
```jsx
<motion.div
  whileHover={{ y: -8, scale: 1.02 }}
  className="rounded-3xl bg-white p-6 shadow-lg"
>
  Content
</motion.div>
```

### Text Gradient
```jsx
<h1 className="text-gradient">
  Gradient Text
</h1>
```

---

## Future Enhancements

- Dark mode implementation
- Additional color themes
- More animation presets
- Component variants library
- Accessibility audit tools
- Design tokens documentation
- Storybook integration

---

## Version
**1.0.0** - November 2025

## Maintained By
LensHub Design Team
