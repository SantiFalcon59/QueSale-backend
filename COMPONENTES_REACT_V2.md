# Análisis de Componentes React - Frontend V2 QueSale

## Resumen General
Análisis completo de 8 páginas HTML generadas por Stitch que muestran la arquitectura de componentes React necesarios para QueSale v2. El diseño utiliza Tailwind CSS con tema oscuro personalizado (Material Design 3) y Material Symbols.

---

## 1. HOME - Desktop (quesale_home/code.html)

### Estructura Principal
- **TopNavBar**: Header fijo con navegación horizontal
- **Hero Section**: Sección inmersiva con imagen de fondo y CTA principal
- **Featured Events Slider**: Grid de tarjetas de eventos (3 cards) con transiciones
- **Trending Near You**: Bento grid con mapa interactivo y alerts
- **CTA Canvas**: Sección de llamada a acción principal
- **Footer**: Links de navegación y redes sociales
- **BottomNavBar**: Navegación móvil (solo visible <768px)
- **Contextual FAB**: Botón flotante para crear evento

### Elementos Interactivos
| Elemento | Tipo | Acciones |
|----------|------|----------|
| Nav Links (Desktop) | Links | Navegación a secciones |
| Notification/Forum Buttons | Buttons | Click handlers |
| Profile Avatar | Button | Profile modal/redirect |
| Slider Buttons (◀▶) | Buttons | Carousel control |
| "Join an Event" | Button | CTA primary |
| "Create Your Own" | Button | CTA secondary |
| Bento Items | Interactive Areas | Expand/view details |
| FAB (Add) | Button | Create event flow |
| Mobile Nav Items | Links | Page navigation |

### Clases Tailwind Clave
```
Grid: grid-cols-1, md:grid-cols-2, lg:grid-cols-3, grid-cols-12, grid-rows-2
Sizing: min-h-[870px], aspect-[4/5], h-[600px], w-full
Spacing: px-6, lg:px-20, gap-8, mb-12
Colors: bg-surface, text-on-surface, bg-primary-container, text-primary
Efectos: hover:scale-105, hover:-translate-y-2, hover:scale-110, transition-all
Rounded: rounded-[2rem], rounded-[3rem], rounded-full, rounded-2xl
Gradients: bg-gradient-to-r, bg-gradient-to-t
Shadows: shadow-[0_0_20px_rgba(124,58,237,0.3)]
Border: border-b-2, border-outline-variant/20
```

### Props de Datos Necesarios
```javascript
{
  navItems: [
    { label: "Home", active: true },
    { label: "Feed", href: "#" },
    { label: "Chat", href: "#" },
    { label: "Profile", href: "#" }
  ],
  userProfile: {
    avatar: "url", // imagen user
    initials: "JS"
  },
  heroContent: {
    badge: "Live in your city",
    title: "THE NIGHT IS YOURS TO OWN",
    subtitle: "Access elite gatherings...",
    ctaButtons: [
      { label: "Join an Event", variant: "primary" },
      { label: "Create Your Own", variant: "secondary" }
    ]
  },
  featuredEvents: [
    {
      id: 1,
      title: "Obsidian Echoes",
      image: "url",
      category: "Trending",
      tags: ["Music"],
      location: "Underground Techno Collective",
      date: "Friday",
      attendees: [avatar1, avatar2],
      count: 42,
      accessType: "Free Access"
    },
    // 2 más...
  ],
  trendingItems: {
    mapImage: "url",
    popupAlert: {
      title: "Secret Rooftop Session",
      location: "Soho",
      spotsLeft: 12
    },
    capacity: 98,
    browseCategories: 14
  }
}
```

---

## 2. HOME - Mobile (quesale_home_mobile/code.html)

### Estructura Principal
- **TopAppBar**: Header compacto con logo y profile
- **Hero Section**: Full-height con imagen y contenido overlay
- **Featured Experiences Carousel**: Horizontal scroll snap
- **Trending Near You**: Bento grid compactado
- **Final CTA**: Call-to-action centrado
- **BottomNavBar**: Navegación principal móvil

### Diferencias Clave vs Desktop
- Hero más compacto (618px vs 870px)
- Carousel horizontal con `snap-x snap-mandatory`
- BottomNavBar activo (Home tab highlighted)
- Menos columnas en grids
- Tipografía más pequeña

### Elementos Interactivos Únicos
- Carousel con snap (deslizar entre eventos)
- Bottom nav con active state visual

### Props similares a Desktop pero adaptados para mobile

---

## 3. DISCOVERY FEED - Desktop (quesale_discovery_feed/code.html)

### Estructura Principal
- **TopNavBar**: Con search bar integrado
- **SideNavBar**: Menú lateral izquierdo (64 unidades ancho)
- **Main Content**: Vertical scroll feed (snap-v-mandatory)
- **Feed Items**: 3 items fullscreen verticales
- **Floating Sidebar**: Acciones derecha (likes, comments, bookmark)
- **BottomNavBar**: Móvil only

### Elementos Interactivos
| Elemento | Acciones |
|----------|----------|
| Search Input | Text input + filter |
| Nav Links (Discovery, Trending, Categories, etc) | Navigation |
| Like Button | Toggle liked state + count |
| Comment Button | Open comments modal |
| Bookmark Button | Toggle saved |
| Share Button | Share event |
| Interested Button | RSVP flow |

### Clases Tailwind Destacadas
```
Scroll: h-screen, overflow-y-scroll, snap-v-mandatory, no-scrollbar
Feed Layout: relative, h-full, snap-start
Glass Effect: glass-panel, backdrop-blur-20px
Interactive: active:scale-95, transition-transform, group-hover
```

### Props de Datos Necesarios
```javascript
{
  sideNav: {
    title: "The Nocturne",
    subtitle: "Elite Digital Concierge",
    items: [
      { icon: "explore", label: "Discovery", active: true },
      { icon: "bolt", label: "Trending", highlighted: true },
      { icon: "category", label: "Categories" },
      // ...
    ]
  },
  feedItems: [
    {
      id: 1,
      title: "VIOLET VORTEX",
      status: "Live Now",
      location: "Basement 52",
      datetime: "OCT 24, 23:00",
      backgroundImage: "url",
      description: "Basement 52 • OCT 24, 23:00",
      engagement: {
        likes: 12400,
        comments: 842,
        bookmarks: 0
      },
      locationPreview: "mapImage url"
    },
    // 2 más...
  ]
}
```

---

## 4. DISCOVERY FEED - Mobile (quesale_discovery_feed_mobile/code.html)

### Estructura Principal
- **TopAppBar**: Menu + logo + profile
- **Main Canvas**: Full-height vertical snap scroll
- **Feed Items**: 2+ items verticales
- **Interaction Sidebar**: Derecha con stats
- **BottomNavBar**: Navegación móvil activa

### Diferencias Clave
- No SideNavBar (en mobile es header menu)
- Layout optimizado para portrait
- Botones de interacción a la derecha más compactos
- Solo 2 feed items visibles vs 3 en desktop

---

## 5. EVENT DETAILS - Desktop (quesale_event_details/code.html)

### Estructura Principal
- **TopNav**: Con back button y share
- **Asymmetric Gallery**: Grid 8+4 cols con imágenes
- **Left Column** (2/3 ancho):
  - Description sección
  - Event Schedule (timeline interactivo)
  - Attendee Wall (Facebook-style)
- **Right Column** (1/3 ancho - Sticky):
  - Location Map
  - Staff Announcements
  - RSVP Card (sticky)
- **Right Sidebar** (320px - Discord style):
  - Live Chat con mensajes

### Elementos Interactivos
| Elemento | Acciones |
|----------|----------|
| Schedule Items | Click para expandir detalles |
| "Interested" Button | RSVP status |
| Share Button | Share event |
| Location "Get Directions" | Maps integration |
| Chat Input | Enviar mensajes |
| Attendee Comments | Like/Reply |
| Images "+14 Photos" | Photo gallery expand |
| Chat Messages | Display user info on hover |

### Clases Tailwind Destacadas
```
Gallery: grid-cols-12, md:col-span-8, md:col-span-4, grid-rows-2
Layout: md:col-span-2, md:col-span-3 (para columnas)
Sticky: sticky top-24 (right sidebar)
Cards: bg-surface-container-low, rounded-2xl, p-6
Schedule: bg-primary-container/10, border-l-4 border-primary
```

### Props de Datos Necesarios
```javascript
{
  eventHeader: {
    title: "NEON VOID: EPISODE IV",
    location: "Cyber-Plaza Underground, Neo Tokyo",
    liveStatus: true,
    images: [mainImage, ...moreImages]
  },
  eventDetails: {
    description: "Step into the abyss...",
    categories: ["Techno", "Visual Arts", "After-Hours"],
    schedule: [
      {
        date: "22 OCT",
        title: "Opening Set: Phase Drift",
        time: "10:00 PM",
        venue: "Main Arena",
        live: false
      },
      {
        date: "23 OCT",
        title: "Main Performance: Orbital Resonance",
        time: "02:00 AM",
        venue: "Main Arena",
        live: true
      }
    ]
  },
  location: {
    name: "The Void Underground",
    address: "4-12-1 Sendagaya, Shibuya City",
    mapImage: "url",
    coordinates: { lat, lng }
  },
  staffFeed: [
    {
      id: 1,
      userName: "Elena Vance",
      timestamp: "2H AGO",
      avatar: "url",
      content: "Cannot wait for the sunrise set!...",
      likes: 12,
      replies: [...]
    }
  ],
  attendees: {
    avatars: [avatar1, avatar2, avatar3],
    totalCount: 2400,
    recentComments: [...]
  },
  ticketing: {
    price: 45.00,
    soldPercentage: 85,
    attendingCount: 2400
  },
  liveChat: {
    onlineCount: 412,
    messages: [
      { user: "dj_phantom", time: "10:42 PM", text: "..." },
      // más...
    ]
  }
}
```

---

## 6. EVENT DETAILS - Mobile (quesale_event_details_mobile/code.html)

### Estructura Principal
- **TopNav**: Back + Share buttons
- **Hero Section**: Full-width image (530px height)
- **Info Bento**: 2-column grid con calendar/schedule icons
- **Sections Collapsibles**:
  - The Atmosphere
  - Event Schedule (horizontal scroll)
  - The Location (map)
  - Staff Feed & Attendee Wall
- **Floating FAB**: Chat bubble con badge de notificaciones
- **Bottom Action Bar**: Price + "Secure Entry" button

### Diferencias vs Desktop
- No right sidebar (chat integrado como FAB)
- Layout vertical simplificado
- Hero más pequeño
- Info en bento compacta
- Botón de compra sticky al bottom

### Props similares a desktop pero layout mobile

---

## 7. SEARCH & FILTER - Desktop (quesale_search_filter/code.html)

### Estructura Principal
- **TopNavBar**: Con search global integrado
- **SideNavBar**: Menú lateral
- **Main Grid** (3+9 cols en XL):
  - **Left Aside** (1/3):
    - Filtro de proximidad (slider)
    - Date presets (Tonight, Tomorrow, Weekend)
    - Vibe timing (checkboxes)
    - Category depth (lista)
  - **Results Area** (2/3):
    - Quick filter scroll (tags horizontales)
    - Section header
    - Results grid (3 cols)
- **FAB**: Map view toggle
- **BottomNavBar**: Móvil only

### Elementos Interactivos
| Elemento | Acciones |
|----------|----------|
| Distance Slider | Range input + live value |
| Date Buttons | Toggle/select preset |
| Time Checkboxes | Multi-select |
| Category List | Click para filtrar |
| Quick Filters | Horizontal scroll + click |
| Event Cards | Click para ver detalles |
| Grid/List Toggle | Switch view mode |
| Map FAB | Show map view |

### Clases Tailwind Destacadas
```
Layout: xl:col-span-3, xl:col-span-9
Glass: glass-panel, backdrop-blur
Range Input: input[type="range"]::-webkit-slider-thumb
Scrollable: overflow-x-auto, no-scrollbar, snap-x
Cards: aspect-[4/5], group-hover:-translate-y-2
```

### Props de Datos Necesarios
```javascript
{
  filters: {
    proximity: {
      min: 1,
      max: 50,
      current: 25,
      unit: "km"
    },
    timeline: [
      { label: "Tonight", value: "tonight", active: true },
      { label: "Tomorrow", value: "tomorrow" },
      { label: "Weekend", value: "weekend" },
      { label: "Custom", value: "custom" }
    ],
    vibeTiming: [
      { icon: "sunny", label: "Daylight Social", checked: false },
      { icon: "nightlight", label: "Prime Evening", checked: true },
      { icon: "bolt", label: "After Hours", checked: false }
    ],
    categories: [
      { name: "Electronic", count: 142 },
      { name: "Art & Culture", count: 28 },
      { name: "Culinary", count: 56 }
    ]
  },
  quickFilters: ["Techno", "Art", "Rooftop", "Speakeasy", "Underground", "Live Jazz"],
  results: [
    {
      id: 1,
      image: "url",
      matchPercentage: 98,
      liveNow: true,
      attendingCount: 1200,
      category: "Industrial • Warehouse",
      title: "Obsidian Rhythm: Episode IV",
      date: "Oct 24",
      distance: "2.4km"
    },
    // más eventos...
  ],
  searchState: {
    query: "Underground Techno",
    resultsCount: 24,
    hasNoResults: false
  }
}
```

---

## 8. SEARCH & FILTER - Mobile (quesale_search_filter_mobile/code.html)

### Estructura Principal
- **TopAppBar**: Menu + logo + profile
- **Search Input**: Buscador con filtro button
- **Category Scroll**: Tags horizontales
- **Refine Section**: Filtros inline (collapsible)
- **Results Grid**: 1 columna full-width
- **BottomNavBar**: Navegación móvil activa en Search

### Diferencias vs Desktop
- Filtros inline (no sidebar lateral)
- Resultados en 1 columna
- Refine section colapsible
- Menos elementos visibles
- Scroll vertical único

---

## Componentes React a Crear

### Componentes Base/Comunes
1. **TopNavBar** - Header con navegación desktop
2. **TopAppBar** - Header móvil compacto
3. **SideNavBar** - Menú lateral (desktop solo)
4. **BottomNavBar** - Navegación móvil
5. **EventCard** - Tarjeta de evento genérica
6. **Button** - Botón con variantes (primary, secondary, glass)

### Componentes de Página
7. **HomePage** - Home con hero + featured + trending
8. **DiscoveryFeed** - Feed vertical fullscreen con snap
9. **EventDetailPage** - Detalle completo de evento
10. **SearchFilterPage** - Búsqueda y filtros

### Componentes Seccionales
11. **HeroSection** - Banner hero con imagen y CTA
12. **FeaturedEventsSlider** - Carousel de eventos
13. **TrendingGrid** - Bento grid con mapa
14. **EventSchedule** - Timeline de horarios
15. **AttendeeWall** - Muro de comentarios Facebook-style
16. **LocationMap** - Widget de mapa
17. **LiveChat** - Chat en vivo
18. **FilterPanel** - Panel de filtros
19. **EventCardGrid** - Grid de resultados
20. **FAB** - Floating action button

### Componentes de UI Reutilizables
21. **Badge** - Para etiquetas y status
22. **Avatar** - Avatares de usuarios
23. **AvatarGroup** - Grupo de avatares con +N
24. **Slider** - Componente rango input
25. **Checkbox** - Custom checkbox
26. **Tabs/Pills** - Botones de filtro
27. **Modal** - Para diálogos
28. **Spinner** - Loading states
29. **Toast** - Notificaciones
30. **GlassPanel** - Componente con efecto glass

### Componentes Contextuales
31. **EventProvider** - Context para datos de eventos
32. **UserProvider** - Context para user data
33. **FilterProvider** - Context para estado de filtros

---

## Temas de Tailwind Configuración

### Colores Principales
```javascript
primary: "#d2bbff",           // Púrpura claro
primary-container: "#7c3aed", // Púrpura vibrante
secondary: "#ddb7ff",         // Púrpura rosado
secondary-container: "#6f00be", // Púrpura profundo
tertiary: "#ffb0cd",          // Rosa
tertiary-container: "#bf2076" // Rosa oscuro
```

### Colores de Superficie
```javascript
surface: "#131313",                 // Negro
surface-container-lowest: "#0e0e0e", // Negro más oscuro
surface-container-low: "#1c1b1b",    // Gris muy oscuro
surface-container-high: "#2a2a2a",   // Gris oscuro
surface-bright: "#393939"             // Gris
outline-variant: "#4a4455"            // Bordes grises
```

### Efectos Especiales
- **glass-effect**: `background: rgba(53, 53, 52, 0.4); backdrop-filter: blur(20px);`
- **glow-hover**: `box-shadow: 0 0 20px rgba(124, 58, 237, 0.3);`
- **pulse-aura**: Animación pulse personalizada

---

## Data Flow & Props

### Estado Global Recomendado (Zustand/Context)
```javascript
{
  // User
  user: { id, name, avatar, profile },
  
  // Events
  events: [],
  eventDetail: {},
  featuredEvents: [],
  trendingEvents: [],
  
  // Feed
  feedItems: [],
  currentFeedIndex: 0,
  
  // Filters
  filters: {
    distance: 25,
    timeline: "tonight",
    vibeTiming: ["prime-evening"],
    categories: [],
    searchQuery: ""
  },
  
  // UI State
  isLoading: false,
  activeTab: "home",
  sidebarOpen: true
}
```

### API Endpoints Necesarios
- `GET /api/events` - Lista de eventos
- `GET /api/events/:id` - Detalle de evento
- `GET /api/events/featured` - Eventos destacados
- `GET /api/events/trending` - Trending near
- `POST /api/events/:id/rsvp` - Marcar interés
- `GET /api/search` - Búsqueda con filtros
- `GET /api/chat/:eventId` - Chat del evento
- `POST /api/chat/:eventId` - Enviar mensaje

---

## Recomendaciones de Implementación

1. **Usar React Router v6** para navegación
2. **Zustand o Context API** para estado global
3. **React Query** para caching de datos
4. **Framer Motion** para animaciones complejas
5. **React Hook Form** + Zod para validaciones
6. **Tailwind CSS** con config personalizado (ya definido)
7. **Responsive primero**: Mobile > Tablet > Desktop
8. **Accesibilidad**: ARIA labels, keyboard navigation
9. **Performance**: Code splitting por rutas, lazy loading de imágenes
10. **TypeScript**: Tipado fuerte para props y estado

