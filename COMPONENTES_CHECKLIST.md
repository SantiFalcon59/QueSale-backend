# Checklist Rápido: Componentes React QueSale V2

## 🏗️ ARQUITECTURA GENERAL

```
src/
├── components/
│   ├── layout/
│   │   ├── TopNavBar.jsx        ✓ Desktop header
│   │   ├── TopAppBar.jsx        ✓ Mobile header  
│   │   ├── SideNavBar.jsx       ✓ Left sidebar (desktop)
│   │   ├── BottomNavBar.jsx     ✓ Mobile bottom nav
│   │   └── Layout.jsx           ✓ Layout wrapper
│   │
│   ├── sections/
│   │   ├── HeroSection.jsx      ✓ Hero + CTA
│   │   ├── FeaturedSlider.jsx   ✓ Event carousel
│   │   ├── TrendingGrid.jsx     ✓ Bento + map
│   │   ├── EventSchedule.jsx    ✓ Timeline
│   │   ├── AttendeeWall.jsx     ✓ Facebook wall
│   │   ├── LocationMap.jsx      ✓ Map widget
│   │   ├── LiveChat.jsx         ✓ Discord-style chat
│   │   ├── FilterPanel.jsx      ✓ Search filters
│   │   └── EventCardGrid.jsx    ✓ Results grid
│   │
│   ├── cards/
│   │   ├── EventCard.jsx        ✓ Generic event card
│   │   ├── EventCardLarge.jsx   ✓ Featured variant
│   │   ├── BentoCard.jsx        ✓ Bento item
│   │   └── ResultCard.jsx       ✓ Search result
│   │
│   ├── common/
│   │   ├── Button.jsx           ✓ All variants
│   │   ├── Badge.jsx            ✓ Tags/labels
│   │   ├── Avatar.jsx           ✓ User avatar
│   │   ├── AvatarGroup.jsx      ✓ Multiple avatars
│   │   ├── GlassPanel.jsx       ✓ Glass effect
│   │   ├── FAB.jsx              ✓ Floating button
│   │   ├── Slider.jsx           ✓ Range input
│   │   ├── Checkbox.jsx         ✓ Custom checkbox
│   │   ├── Tabs.jsx             ✓ Filter pills
│   │   └── Modal.jsx            ✓ Dialog
│   │
│   └── feed/
│       ├── FeedContainer.jsx    ✓ Vertical snap
│       ├── FeedItem.jsx         ✓ Single feed item
│       └── FeedActions.jsx      ✓ Like/comment/share
│
├── pages/
│   ├── HomePage.jsx             ✓ / (home hero)
│   ├── DiscoveryPage.jsx        ✓ /discovery (feed)
│   ├── EventDetailPage.jsx      ✓ /event/:id
│   ├── SearchPage.jsx           ✓ /search (filters)
│   └── ProfilePage.jsx          ✓ /profile (future)
│
├── contexts/
│   ├── EventContext.jsx
│   ├── UserContext.jsx
│   └── FilterContext.jsx
│
├── hooks/
│   ├── useEvents.js
│   ├── useFilters.js
│   ├── useChat.js
│   └── useAuth.js
│
├── services/
│   ├── eventService.js
│   ├── userService.js
│   └── chatService.js
│
├── utils/
│   ├── constants.js             # Tailwind classes, URLs
│   ├── formatters.js            # Date, distance
│   └── validators.js
│
└── styles/
    └── globals.css              # Custom animations
```

---

## 📱 COMPONENTES POR PANTALLA

### HOME (/)
- [x] TopNavBar
- [x] HeroSection
- [x] FeaturedSlider → EventCard
- [x] TrendingGrid → BentoCard
- [x] CTA Section
- [x] Footer
- [x] FAB (Create)
- [x] BottomNavBar (mobile)

### DISCOVERY (/discovery)
- [x] TopAppBar + Search
- [x] SideNavBar (desktop)
- [x] FeedContainer
  - [x] FeedItem (x3) → fullscreen
  - [x] FeedActions (likes, comments, bookmark)
  - [x] LocationPreview
- [x] BottomNavBar (mobile)

### EVENT DETAIL (/event/:id)
- [x] TopNav (back + share)
- [x] Gallery (asymmetric grid)
- [x] Description + Categories
- [x] EventSchedule (timeline)
- [x] AttendeeWall (comments)
- [x] LocationMap
- [x] StaffFeed
- [x] RSVP Card (sticky right)
- [x] LiveChat (sidebar right)
- [x] BottomActionBar (mobile)

### SEARCH (/search)
- [x] TopNavBar + Search
- [x] SideNavBar (desktop)
- [x] FilterPanel
  - [x] DistanceSlider
  - [x] DatePresets
  - [x] TimeCheckboxes
  - [x] CategoryList
- [x] QuickFilters (scroll)
- [x] EventCardGrid (results)
- [x] EmptyState with suggestions
- [x] FAB (Map)

---

## 🎨 COMPONENTES REUTILIZABLES (Priority)

### TIER 1 - Críticos
- [ ] Button (primary, secondary, glass)
- [ ] EventCard
- [ ] Badge
- [ ] Avatar
- [ ] GlassPanel
- [ ] Modal

### TIER 2 - Importantes
- [ ] Slider (range)
- [ ] Checkbox
- [ ] Tabs/Pills
- [ ] FAB
- [ ] AvatarGroup
- [ ] Spinner

### TIER 3 - Mejoras
- [ ] Toast
- [ ] Dropdown
- [ ] Carousel

---

## 🎯 DATA PROPS CLAVE

### EventCard Props
```javascript
{
  id: string,
  title: string,
  image: string,
  category: string,
  tags: string[],
  description?: string,
  location: string,
  date: string,
  attendees: Avatar[],
  attendeeCount: number,
  accessType: "free" | "paid" | "invite",
  price?: number,
  status: "live" | "upcoming",
  matchPercentage?: number
}
```

### FeedItem Props
```javascript
{
  id: string,
  title: string,
  location: string,
  datetime: string,
  backgroundImage: string,
  description: string,
  engagement: {
    likes: number,
    comments: number,
    bookmarks: number
  },
  userInteraction: {
    liked: boolean,
    bookmarked: boolean
  },
  onInterested: () => void,
  onShare: () => void
}
```

### FilterPanel Props
```javascript
{
  filters: {
    distance: number,
    timeline: string,
    vibeTiming: string[],
    categories: string[]
  },
  onFilterChange: (key, value) => void,
  onReset: () => void,
  resultsCount?: number
}
```

---

## 🔄 STATE MANAGEMENT

### Global State (Zustand/Redux)
```javascript
// Events
- events: Event[]
- eventDetail: Event | null
- featuredEvents: Event[]

// User
- user: User | null
- profile: Profile | null

// UI
- activeTab: "home" | "discovery" | "search"
- sidebarOpen: boolean
- loading: boolean

// Filters
- filters: FilterState
- searchQuery: string

// Feed
- feedItems: FeedItem[]
- currentFeedIndex: number
```

---

## 🎬 ANIMACIONES CLAVE

- [ ] Hover card lift: `-translate-y-2`
- [ ] Icon scale on hover: `group-hover:scale-110`
- [ ] Button press: `active:scale-95`
- [ ] Fade transitions: `transition-all duration-300`
- [ ] Pulsing live indicator: `animate-pulse`
- [ ] Glow effects: `box-shadow: 0 0 20px rgba(124,58,237,0.3)`
- [ ] Feed snap scroll: `snap-v-mandatory` / `snap-x`

---

## 📦 LIBRERÍAS A INSTALAR

```bash
npm install react-router-dom          # Routing
npm install zustand                   # State (or: redux @reduxjs/toolkit)
npm install @tanstack/react-query     # Data fetching
npm install framer-motion             # Animations
npm install react-hook-form           # Forms
npm install zod                       # Validation
npm install clsx classnames           # Conditional classes
npm install axios                     # HTTP client
npm install date-fns                  # Date formatting
npm install lodash-es                 # Utilities
```

---

## 🚀 ORDEN DE IMPLEMENTACIÓN RECOMENDADO

1. **Setup Base**
   - [ ] Proyecto vite + React 18
   - [ ] Tailwind config con colores custom
   - [ ] React Router setup
   - [ ] Zustand/Context setup

2. **Layout Components** (Semana 1)
   - [ ] TopNavBar
   - [ ] TopAppBar
   - [ ] SideNavBar
   - [ ] BottomNavBar
   - [ ] Layout wrapper

3. **UI Primitives** (Semana 1-2)
   - [ ] Button
   - [ ] Badge
   - [ ] Avatar
   - [ ] GlassPanel
   - [ ] Modal

4. **Card Components** (Semana 2)
   - [ ] EventCard
   - [ ] BentoCard
   - [ ] ResultCard

5. **Home Page** (Semana 2-3)
   - [ ] HeroSection
   - [ ] FeaturedSlider
   - [ ] TrendingGrid
   - [ ] Integración completa

6. **Discovery Feed** (Semana 3)
   - [ ] FeedContainer + snap scroll
   - [ ] FeedItem
   - [ ] FeedActions

7. **Event Detail** (Semana 4)
   - [ ] Gallery
   - [ ] EventSchedule
   - [ ] AttendeeWall
   - [ ] LiveChat

8. **Search & Filters** (Semana 4-5)
   - [ ] FilterPanel
   - [ ] Slider component
   - [ ] EventCardGrid
   - [ ] Lógica de búsqueda

9. **Polish & Optimización** (Semana 5+)
   - [ ] Loading states
   - [ ] Error boundaries
   - [ ] Mobile responsiveness
   - [ ] Performance tuning

---

## 📋 TESTING CHECKLIST

- [ ] Responsive: 320px, 768px, 1200px, 1920px
- [ ] Dark mode: Verificar todos los colores
- [ ] Interactividad: Todos los botones funcionan
- [ ] Animaciones: Suave en mobile
- [ ] Accesibilidad: ARIA labels, tab order
- [ ] Performance: Lighthouse >90

---

## 🔗 API INTEGRATION POINTS

| Componente | Endpoint | Método |
|-----------|----------|--------|
| HomePage | GET /events/featured | GET |
| HomePage | GET /events/trending | GET |
| DiscoveryFeed | GET /events/feed | GET |
| EventDetail | GET /events/:id | GET |
| EventDetail | POST /events/:id/rsvp | POST |
| EventDetail | GET /chat/:eventId | GET (websocket) |
| SearchPage | GET /events/search | GET (con query params) |

---

## 📝 PROPS VALIDATION (Zod/TypeScript)

```typescript
// Event
type Event = {
  id: string;
  title: string;
  image: string;
  category: string;
  attendees: number;
  // ...
}

// FeedItem
type FeedItem = Event & {
  engagement: {
    likes: number;
    comments: number;
  }
}

// Filter
type FilterState = {
  distance: number; // 1-50
  timeline: "tonight" | "tomorrow" | "weekend" | "custom";
  vibeTiming: ("daylight" | "prime-evening" | "after-hours")[];
  categories: string[];
}
```

