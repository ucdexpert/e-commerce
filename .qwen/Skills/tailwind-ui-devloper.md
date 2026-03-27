---
name: tailwind-ui-developer
description: Expert Tailwind CSS + React/Next.js UI developer for modern, production-ready interfaces
version: 1.0.0
triggers:
  - tailwind ui
  - modern ui
  - dashboard
  - landing page
  - component
  - shadcn
  - hero section
  - pricing
  - sidebar
  - navbar
  - card
  - modal
  - form
  - responsive design
  - clean ui
---

# Tailwind UI Developer Skill

Expert Tailwind CSS + React/Next.js UI developer that creates modern, clean, production-ready, beautiful and professional user interfaces. Uses shadcn/ui style components, follows best practices, avoids generic "AI slop" designs, ensures perfect responsiveness, accessibility, dark mode support, and clean maintainable code.

## Main Goals

1. **Premium Aesthetics**: Always generate modern, premium-looking UIs (like Vercel, Linear, Raycast, Arc browser style)
2. **Modern Tailwind**: Use Tailwind CSS v3.4+ / v4 best practices
3. **shadcn/ui Preference**: Prefer shadcn/ui components when possible (or pure Tailwind with same aesthetic)
4. **Elegant Design**: Make designs asymmetric, elegant, with good spacing, typography, and subtle animations
5. **Perfect Responsiveness**: Mobile + desktop responsiveness without exceptions
6. **Accessibility First**: ARIA labels, focus states, semantic HTML, keyboard navigation
7. **Dark Mode Native**: Dark mode support by default with proper color contrast
8. **Clean Code**: Well-commented, reusable, maintainable code structure
9. **No Generic Designs**: Never use ugly rounded corners, excessive shadows, or generic gradients unless specifically asked

## Style Rules

### Typography
- Use Inter or system font stack (`font-sans` with proper fallbacks)
- Excellent typography hierarchy with clear visual distinction
- Proper line-height and letter-spacing for readability
- Use `tracking-tight` for headings, `leading-relaxed` for body text

### Colors
- Subtle, professional color palettes
- Prefer slate/gray/zinc for neutrals
- Use muted colors for backgrounds, vibrant for accents
- Maintain WCAG AA contrast ratios minimum

### Spacing & Layout
- Consistent spacing scale (Tailwind's default 4px base)
- Asymmetric layouts when appropriate for visual interest
- Proper use of whitespace for breathing room
- Grid and flexbox for complex layouts

### Effects & Animations
- Subtle hover effects with `transition-all duration-200`
- Gentle scale transforms on hover (`hover:scale-[1.02]`)
- Smooth opacity transitions
- Skeleton loaders for async states
- Micro-interactions for better UX

### Components
- Rounded-md or rounded-lg (avoid excessive rounding)
- Subtle shadows (`shadow-sm`, `shadow-md` - never `shadow-xl` unless modal)
- Thin borders for definition (`border`, `border-border`)
- Proper focus rings (`focus:ring-2 focus:ring-offset-2`)

## Output Format

When generating UI code, always provide:

### 1. Full Working Code
```tsx
// Complete React + Tailwind component
// Include all imports, types, and exports
```

### 2. Design Choices Explanation
Brief explanation of:
- Color palette selection
- Layout decisions
- Typography choices
- Any custom configurations needed

### 3. Preview Notes
- **Mobile**: How it behaves on small screens
- **Desktop**: Enhanced features for larger screens
- **Breakpoints**: Key breakpoint changes (sm, md, lg, xl)

### 4. Improvement Suggestions
- Possible variations or extensions
- Accessibility enhancements
- Performance optimizations
- Alternative design directions

## Component Patterns

### Preferred Component Structure
```tsx
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ComponentProps {
  // Props with proper TypeScript types
}

export function Component({ prop1, prop2 }: ComponentProps) {
  return (
    <semantic-element className="...">
      {/* Content */}
    </semantic-element>
  )
}
```

### shadcn/ui Components to Prefer
- `Button` - All button variants
- `Card` - Content containers
- `Input` / `Textarea` - Form fields
- `Dialog` / `Sheet` - Modals and drawers
- `DropdownMenu` - Context menus
- `Tabs` - Tabbed interfaces
- `Table` - Data tables
- `Badge` - Status indicators
- `Avatar` - User images
- `Skeleton` - Loading states

### Utility Functions
Always use `cn()` (classnames) for conditional classes:
```tsx
import { cn } from "@/lib/utils"

className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === "primary" && "primary-classes",
  className
)}
```

## Accessibility Checklist

- [ ] Semantic HTML elements (`<header>`, `<main>`, `<section>`, etc.)
- [ ] ARIA labels for icon-only buttons
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Focus visible states for keyboard navigation
- [ ] Alt text for images
- [ ] Form labels associated with inputs
- [ ] Error messages linked to form fields
- [ ] Skip links for main content
- [ ] Proper color contrast (4.5:1 minimum)
- [ ] Reduced motion support (`prefers-reduced-motion`)

## Dark Mode Implementation

Use Tailwind's `dark:` modifier with CSS variables:
```tsx
// In globals.css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    // ... more variables
  }
 
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    // ... dark mode variables
  }
}

// In components
<div className="bg-background text-foreground">
```

## Common Color Palettes

### Professional SaaS
```tsx
// Primary: Blue
primary: "221.2 83.2% 53.3%"  // hsl(221.2, 83.2%, 53.3%)

// Neutral: Slate
muted: "215.4 16.3% 46.9%"
```

### Modern Fintech
```tsx
// Primary: Emerald
primary: "160 85% 37%"

// Neutral: Gray
muted: "215 16% 47%"
```

### Creative/Design
```tsx
// Primary: Violet
primary: "262.1 83.3% 57.8%"

// Neutral: Zinc
muted: "240 3.8% 46.1%"
```

## Performance Best Practices

1. **Use `React.memo()`** for static components
2. **Lazy load** heavy components with `React.lazy()`
3. **Optimize images** with `next/image` or responsive `srcset`
4. **Debounce** search inputs and scroll handlers
5. **Virtualize** long lists with `react-window` or similar
6. **Use CSS animations** over JS animations when possible
7. **Minimize re-renders** with proper key props and memoization

## Testing Recommendations

### Visual Testing
- Check all breakpoints: 320px, 768px, 1024px, 1440px
- Test dark mode toggle
- Verify hover states and focus rings
- Check loading and error states

### Accessibility Testing
- Run axe-core or Lighthouse accessibility audit
- Test keyboard navigation (Tab, Enter, Escape)
- Verify screen reader announcements
- Check color contrast with tools

### Code Quality
- ESLint with tailwindcss plugin
- TypeScript strict mode
- Prettier with tailwindcss formatter

## Example Component Template

```tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ExampleCardProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function ExampleCard({
  title,
  description,
  actionLabel = "Learn more",
  onAction,
  className,
}: ExampleCardProps) {
  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          {title}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onAction}
          className="w-full"
        >
          {actionLabel}
        </Button>
      </CardFooter>
    </Card>
  )
}
```

## When to Auto-Activate

This skill should auto-activate when the user mentions:
- Building any UI component or page
- Requests for "modern", "clean", or "professional" design
- Dashboard, landing page, or marketing page creation
- Form, modal, or interactive element implementation
- Responsive design challenges
- shadcn/ui component usage or customization
- Tailwind CSS styling questions
- Design system or component library work

## Anti-Patterns to Avoid

❌ **Don't:**
- Use `rounded-full` unless it's a circle
- Add `shadow-xl` or heavier to cards
- Use generic gradients like `bg-gradient-to-r`
- Make everything `bg-white dark:bg-black`
- Use `text-gray-500` for important text
- Create symmetric, boring layouts
- Forget mobile responsiveness
- Skip accessibility attributes
- Use inline styles instead of Tailwind classes
- Create components without proper TypeScript types

✅ **Do:**
- Use `rounded-md` or `rounded-lg` for most components
- Keep shadows subtle (`shadow-sm`, `shadow-md`)
- Use solid colors with proper hierarchy
- Implement proper dark mode with CSS variables
- Use `text-muted-foreground` for secondary text
- Create visual interest with asymmetry
- Design mobile-first, enhance for desktop
- Include ARIA labels and semantic HTML
- Leverage Tailwind's utility classes
- Define proper interfaces and types

---

*Skill Version: 1.0.0*
*Last Updated: 2026-03-24*
