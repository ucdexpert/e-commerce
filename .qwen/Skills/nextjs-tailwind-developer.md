---
name: nextjs-tailwind-developer
description: Expert Next.js 16 (App Router) + TypeScript + Tailwind CSS + shadcn/ui developer for production-ready full-stack features
version: 1.0.0
triggers:
  - next.js
  - nextjs
  - app router
  - shadcn
  - tailwind component
  - dashboard
  - landing page
  - form
  - server action
  - api route
  - page
  - layout
  - component
---

# Next.js Tailwind Developer Skill

Expert Next.js 16 (App Router) + TypeScript + Tailwind CSS + shadcn/ui developer. Creates production-ready, modern, clean, and beautiful full-stack or frontend features for Next.js applications. Follows all latest Next.js best practices, avoids AI slop, and produces premium-quality UIs and code.

## Key Requirements

### Core Stack
1. **Next.js App Router**: Always use `app/` directory structure
2. **TypeScript**: Strict mode with proper types and interfaces
3. **Tailwind CSS**: v4 best practices (or latest v3.4+)
4. **shadcn/ui**: Copy-paste style components for all UI elements
5. **Lucide React**: Default icon library

### Architecture Principles
1. **Server Components by Default**: Use `"use client"` only when necessary (interactivity, hooks, browser APIs)
2. **Server Actions**: For all form mutations and data modifications
3. **Proper Loading States**: Use `loading.tsx` and React Suspense
4. **Error Boundaries**: Implement `error.tsx` for graceful error handling
5. **Mobile-First**: Excellent responsive design starting from mobile
6. **Dark Mode Native**: Support via `next-themes` or Tailwind `dark:` prefix
7. **Accessibility First**: ARIA labels, focus states, semantic HTML
8. **Performance Optimized**: No unnecessary re-renders, proper caching, image optimization

### Design Philosophy
- **Modern Premium Look**: Vercel, Linear, Raycast, Dub.co style aesthetics
- **Excellent Typography**: Inter or system font stack
- **Subtle Animations**: Hover effects and transitions (use framer-motion only if explicitly asked)
- **Proper Spacing**: Consistent spacing scale with proper visual hierarchy
- **No Generic AI Designs**: Never produce ugly, template-looking interfaces

## Output Format

### Always Provide
1. **Complete Ready-to-Copy Code**: Full working code with proper file paths
2. **Folder Structure**: When creating multiple files, show the complete structure
3. **Design Decisions**: Explain important architectural or design choices
4. **Improvement Suggestions**: Alternative approaches or future enhancements

### For Full Pages
Provide all necessary files:
- `page.tsx` - Main page component
- `layout.tsx` - Page layout (if custom)
- `loading.tsx` - Loading state (if needed)
- `error.tsx` - Error boundary (if needed)
- Components - All reusable components
- Server Actions - All mutations and data operations
- Types - TypeScript interfaces and types

## File Structure Conventions

### Recommended Project Structure
```
app/
├── (auth)/
│   ├── login/
│   │   ├── page.tsx
│   │   └── actions.ts
│   └── register/
│       └── page.tsx
├── (dashboard)/
│   ├── layout.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── components/
│   └── settings/
│       └── page.tsx
├── api/
│   └── webhooks/
│       └── route.ts
├── globals.css
├── layout.tsx
└── page.tsx

components/
├── ui/              # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
├── forms/           # Form components
├── dashboard/       # Dashboard-specific components
└── shared/          # Shared components

lib/
├── actions.ts       # Server actions
├── utils.ts         # Utilities (cn, formatters)
├── db.ts            # Database client
└── auth.ts          # Auth utilities

hooks/               # Custom React hooks
types/               # TypeScript type definitions
```

### Component File Structure
```tsx
// Top: Imports
import { } from ""

// Then: Types/Interfaces
interface ComponentProps { }

// Then: Component
export function Component() { }
```

## Server Actions Best Practices

### Basic Server Action
```tsx
"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createUser(formData: FormData) {
  const email = formData.get("email") as string
  const name = formData.get("name") as string

  // Validate
  if (!email || !name) {
    return { error: "Missing required fields" }
  }

  // Process
  await db.user.create({ data: { email, name } })

  // Revalidate and redirect
  revalidatePath("/dashboard")
  redirect("/dashboard")
}
```

### Server Action with Zod Validation
```tsx
"use server"

import { z } from "zod"

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
})

export async function updateUser(data: z.infer<typeof schema>) {
  const validated = schema.parse(data)
  // ...
}
```

### Form Component with Server Action
```tsx
"use client"

import { useFormState } from "react-dom"
import { createUser } from "./actions"

export function CreateUserForm() {
  const [state, formAction] = useFormState(createUser, null)

  return (
    <form action={formAction}>
      <Input name="email" type="email" placeholder="Email" />
      <Input name="name" placeholder="Name" />
      {state?.error && <p className="text-destructive">{state.error}</p>}
      <Button type="submit">Create User</Button>
    </form>
  )
}
```

## Next.js 16 Features to Use

### Parallel Routes
```tsx
// app/dashboard/@analytics/page.tsx
export default function AnalyticsPage() {
  return <AnalyticsDashboard />
}

// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  analytics,
}: {
  children: React.ReactNode
  analytics: React.ReactNode
}) {
  return (
    <div>
      {children}
      {analytics}
    </div>
  )
}
```

### Intercepting Routes
```tsx
// app/(.)photo/[id]/page.tsx
// Intercepts /photo/[id] when navigated from same tab
export default function PhotoModal({ params }: { params: { id: string } }) {
  return (
    <Dialog>
      <Photo id={params.id} />
    </Dialog>
  )
}
```

### Partial Prerendering (PPR)
```tsx
import { Suspense } from "react"

export default function Page() {
  return (
    <>
      <StaticHeader />
      <Suspense fallback={<Loading />}>
        <DynamicContent />
      </Suspense>
    </>
  )
}
```

## Metadata & SEO

### Static Metadata
```tsx
export const metadata = {
  title: "Dashboard | MyApp",
  description: "Manage your account and settings",
  keywords: ["dashboard", "account", "settings"],
  openGraph: {
    title: "Dashboard | MyApp",
    description: "Manage your account and settings",
    images: ["/og-dashboard.png"],
  },
  twitter: {
    card: "summary_large_image",
  },
}
```

### Dynamic Metadata
```tsx
interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props) {
  const product = await getProduct(params.slug)
  
  return {
    title: `${product.name} | MyApp`,
    description: product.description,
  }
}
```

## Loading & Error States

### loading.tsx
```tsx
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}
```

### error.tsx
```tsx
"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-2xl font-semibold mb-4">Something went wrong</h2>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
```

## shadcn/ui Components

### Always Prefer These Components
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ScrollArea,
  ScrollBar,
} from "@/components/ui/scroll-area"
import {
  Separator,
} from "@/components/ui/separator"
import {
  Progress,
} from "@/components/ui/progress"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
```

### Icons (Lucide React)
```tsx
import {
  Home,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Plus,
  Edit,
  Trash2,
  Check,
  XCircle,
  AlertCircle,
  Info,
  Loader2,
  ArrowRight,
  ExternalLink,
  Download,
  Upload,
  Moon,
  Sun,
  Monitor,
} from "lucide-react"
```

## Dark Mode Implementation

### Using next-themes (Recommended)
```tsx
// app/providers.tsx
"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// app/layout.tsx
import { ThemeProvider } from "./providers"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

// Toggle Component
"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

## Performance Best Practices

### Image Optimization
```tsx
import Image from "next/image"

<Image
  src="/hero.png"
  alt="Hero"
  width={1200}
  height={630}
  priority
  className="object-cover"
/>
```

### Dynamic Imports
```tsx
import dynamic from "next/dynamic"

const HeavyComponent = dynamic(() => import("./heavy-component"), {
  loading: () => <Skeleton className="h-64 w-full" />,
  ssr: false, // if client-only
})
```

### Caching Strategies
```tsx
// Force cache
const data = await db.query.findMany({
  cache: "force-cache",
})

// Revalidate every 60 seconds
const data = await fetch("/api/data", {
  next: { revalidate: 60 },
})

// Opt out of caching
const data = await fetch("/api/data", {
  cache: "no-store",
})
```

### Optimistic Updates
```tsx
"use client"

import { useOptimistic } from "react"

export function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimistic] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, newTodo]
  )

  return (
    <ul>
      {optimisticTodos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  )
}
```

## Accessibility Checklist

- [ ] Semantic HTML (`<main>`, `<section>`, `<article>`, `<nav>`)
- [ ] ARIA labels for icon buttons
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Focus visible states
- [ ] Skip links for main content
- [ ] Form labels associated with inputs
- [ ] Error messages linked via `aria-describedby`
- [ ] Alt text for images
- [ ] Keyboard navigation support
- [ ] Screen reader announcements for dynamic content
- [ ] Color contrast (WCAG AA minimum)
- [ ] Reduced motion support (`prefers-reduced-motion`)

## Common Patterns

### CRUD Page Pattern
```tsx
// app/users/page.tsx
import { getUsers } from "@/lib/db"
import { UserList } from "./components/user-list"
import { CreateUserDialog } from "./components/create-user-dialog"

export const metadata = {
  title: "Users | Admin",
  description: "Manage users",
}

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users</h1>
        <CreateUserDialog />
      </div>
      <UserList users={users} />
    </div>
  )
}
```

### Form with Server Action Pattern
```tsx
// app/settings/page.tsx
import { updateSettings } from "./actions"
import { SettingsForm } from "./components/settings-form"

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings
        </p>
      </div>
      <SettingsForm action={updateSettings} />
    </div>
  )
}

// components/settings-form.tsx
"use client"

import { useFormState } from "react-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Props {
  action: (formData: FormData) => Promise<{ error?: string }>
}

export function SettingsForm({ action }: Props) {
  const [state, formAction] = useFormState(action, null)

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" />
      </div>
      {state?.error && (
        <p className="text-destructive text-sm">{state.error}</p>
      )}
      <Button type="submit">Save Changes</Button>
    </form>
  )
}
```

### API Route Pattern
```tsx
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await db.user.findUnique({
      where: { id: params.id },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  
  const updated = await db.user.update({
    where: { id: params.id },
    data: body,
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await db.user.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ success: true })
}
```

## Anti-Patterns to Avoid

❌ **Don't:**
- Use `pages/` directory (always use `app/`)
- Create client components without `"use client"` directive
- Use `getServerSideProps` or `getStaticProps` (use Server Components)
- Fetch data in client components (use Server Components or Server Actions)
- Use excessive `useState` and `useEffect` (prefer Server Components)
- Create forms without Server Actions
- Skip loading states
- Ignore error boundaries
- Use generic AI-looking designs
- Forget TypeScript types
- Skip accessibility attributes
- Use inline styles instead of Tailwind

✅ **Do:**
- Use `app/` directory structure
- Server Components by default
- Server Actions for mutations
- Proper loading.tsx and error.tsx
- shadcn/ui components
- TypeScript with strict types
- Mobile-first responsive design
- Dark mode support
- Accessibility best practices
- Clean, maintainable code structure

---

*Skill Version: 1.0.0*
*Last Updated: 2026-03-24*
