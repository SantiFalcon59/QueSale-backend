# Ejemplos de Implementación - Componentes QueSale V2

## 1. Button Component (Reutilizable)

```jsx
// components/common/Button.jsx
import React from 'react';
import clsx from 'clsx';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  isLoading = false,
  className,
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'font-bold rounded-full transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50';
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:scale-105',
    secondary: 'bg-surface-container-high text-on-surface border border-outline-variant/20 hover:bg-surface-container-highest',
    glass: 'glass-panel border border-outline-variant/30 text-on-surface hover:bg-surface-container-high',
    tertiary: 'bg-tertiary-container text-on-tertiary-container hover:scale-105'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-8 py-4 text-base',
    lg: 'px-10 py-5 text-lg'
  };
  
  return (
    <button
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block animate-spin mr-2">⟳</span>
      ) : Icon ? (
        <Icon className="inline mr-2" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
```

## 2. EventCard Component

```jsx
// components/cards/EventCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AvatarGroup from '../common/AvatarGroup';

const EventCard = ({ event, featured = false }) => {
  const navigate = useNavigate();
  
  return (
    <div
      className={clsx(
        'group relative rounded-3xl overflow-hidden bg-surface-container-low transition-all duration-300 cursor-pointer',
        featured ? 'aspect-[4/5]' : 'aspect-[4/5]',
        'hover:-translate-y-2'
      )}
      onClick={() => navigate(`/event/${event.id}`)}
    >
      {/* Background Image */}
      <img
        src={event.image}
        alt={event.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent" />
      
      {/* Live Badge */}
      {event.status === 'live' && (
        <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full">
          <span className="h-2 w-2 rounded-full bg-tertiary animate-pulse" />
          <span className="text-[10px] font-bold text-tertiary uppercase">Live</span>
        </div>
      )}
      
      {/* Content */}
      <div className="absolute bottom-0 p-6 w-full">
        <div className="flex gap-2 mb-4">
          <span className="px-3 py-1 bg-tertiary-container text-on-tertiary-container rounded-full text-[10px] font-bold uppercase">
            {event.category}
          </span>
          {event.tags?.map(tag => (
            <span
              key={tag}
              className="px-3 py-1 bg-surface-variant/50 backdrop-blur-md text-on-surface rounded-full text-[10px] font-bold uppercase"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <h3 className="text-2xl font-bold mb-1">{event.title}</h3>
        <p className="text-on-surface-variant text-sm mb-4">{event.location}</p>
        
        <div className="flex items-center justify-between">
          <AvatarGroup avatars={event.attendees} count={event.attendeeCount} />
          <span className="text-primary font-bold">{event.accessType}</span>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
```

## 3. FeedContainer Component (Vertical Snap)

```jsx
// components/feed/FeedContainer.jsx
import React, { useState, useCallback } from 'react';
import FeedItem from './FeedItem';

const FeedContainer = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = useCallback((e) => {
    const scrollTop = e.target.scrollTop;
    const itemHeight = e.target.clientHeight;
    const newIndex = Math.round(scrollTop / itemHeight);
    setCurrentIndex(newIndex);
  }, []);

  return (
    <main
      className="h-screen overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-surface"
      onScroll={handleScroll}
    >
      {items.map((item) => (
        <FeedItem key={item.id} item={item} />
      ))}
    </main>
  );
};

export default FeedContainer;
```

```jsx
// components/feed/FeedItem.jsx
import React, { useState } from 'react';
import Button from '../common/Button';

const FeedItem = ({ item }) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <section className="relative h-full w-full snap-start flex flex-col justify-end">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={item.backgroundImage}
          alt={item.title}
          className="w-full h-full object-cover opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 pb-24 md:pb-12 max-w-4xl flex w-full justify-between">
        <div className="flex-1 pr-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse shadow-[0_0_10px_#ffb0cd]" />
            <span className="text-[0.75rem] font-bold tracking-[0.15em] uppercase text-tertiary">
              Live Now
            </span>
          </div>

          <h1 className="text-4xl md:text-7xl font-extrabold text-on-surface tracking-tighter mb-2 leading-none">
            {item.title}
          </h1>

          <p className="text-lg md:text-xl text-on-surface-variant font-medium mb-6">
            {item.location} • {item.datetime}
          </p>

          <div className="flex items-center gap-4">
            <Button variant="primary" size="lg" onClick={item.onInterested}>
              Interested
            </Button>
            <button
              onClick={item.onShare}
              className="p-4 rounded-full glass-panel border border-outline-variant/20 text-on-surface active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined">ios_share</span>
            </button>
            <button className="p-4 rounded-full glass-panel border border-outline-variant/20 text-on-surface active:scale-95 transition-transform">
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
          </div>
        </div>

        {/* Interaction Sidebar */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center">
            <button
              onClick={() => setLiked(!liked)}
              className="p-3 rounded-full glass-panel text-primary shadow-lg hover:scale-110 transition-transform"
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontVariationSettings: liked ? \"'FILL' 1\" : \"'FILL' 0\"
                }}
              >
                favorite
              </span>
            </button>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">
              {item.engagement.likes}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <button className="p-3 rounded-full glass-panel text-on-surface shadow-lg">
              <span className="material-symbols-outlined">chat_bubble</span>
            </button>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">
              {item.engagement.comments}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className="p-3 rounded-full glass-panel text-on-surface shadow-lg"
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontVariationSettings: bookmarked ? \"'FILL' 1\" : \"'FILL' 0\"
                }}
              >
                bookmark
              </span>
            </button>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">
              Save
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeedItem;
```

## 4. FilterPanel Component

```jsx
// components/sections/FilterPanel.jsx
import React, { useCallback } from 'react';
import Slider from '../common/Slider';
import Checkbox from '../common/Checkbox';

const FilterPanel = ({ filters, onFilterChange, onReset, resultsCount }) => {
  const handleDistanceChange = useCallback((value) => {
    onFilterChange('distance', value);
  }, [onFilterChange]);

  return (
    <aside className="glass-panel p-6 rounded-3xl border border-outline-variant/10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold tracking-tight text-primary">Refine Search</h3>
        <button
          onClick={onReset}
          className="text-xs text-secondary font-bold uppercase tracking-widest hover:underline"
        >
          Reset
        </button>
      </div>

      {/* Distance Slider */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-on-surface">Proximity</label>
          <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">
            {filters.distance}km
          </span>
        </div>
        <Slider
          min={1}
          max={50}
          value={filters.distance}
          onChange={handleDistanceChange}
        />
      </div>

      {/* Date Presets */}
      <div className="space-y-4">
        <label className="text-sm font-semibold text-on-surface">Timeline</label>
        <div className="grid grid-cols-2 gap-2">
          {['Tonight', 'Tomorrow', 'Weekend', 'Custom'].map((date, idx) => (
            <button
              key={date}
              className={clsx(
                'py-2.5 px-2 font-bold text-xs rounded-xl transition-colors',
                idx === 0
                  ? 'bg-primary text-on-primary-fixed shadow-[0_0_15px_rgba(124,58,237,0.4)]'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
              )}
              onClick={() => onFilterChange('timeline', date.toLowerCase())}
            >
              {date}
            </button>
          ))}
        </div>
      </div>

      {/* Vibe Timing Checkboxes */}
      <div className="space-y-4">
        <label className="text-sm font-semibold text-on-surface">Vibe Timing</label>
        <div className="flex flex-col gap-2">
          {[
            { icon: 'sunny', label: 'Daylight Social', key: 'daylight' },
            { icon: 'nightlight', label: 'Prime Evening', key: 'prime-evening' },
            { icon: 'bolt', label: 'After Hours', key: 'after-hours' }
          ].map(({ icon, label, key }) => (
            <Checkbox
              key={key}
              label={label}
              icon={icon}
              checked={filters.vibeTiming.includes(key)}
              onChange={(checked) => {
                const newTiming = checked
                  ? [...filters.vibeTiming, key]
                  : filters.vibeTiming.filter(t => t !== key);
                onFilterChange('vibeTiming', newTiming);
              }}
            />
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <label className="text-sm font-semibold text-on-surface">Category Depth</label>
        <div className="space-y-1">
          {[
            { name: 'Electronic', count: 142 },
            { name: 'Art & Culture', count: 28 },
            { name: 'Culinary', count: 56 }
          ].map(({ name, count }) => (
            <div
              key={name}
              className="flex items-center justify-between p-2 hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
              onClick={() => onFilterChange('category', name)}
            >
              <span className="text-sm text-on-surface-variant">{name}</span>
              <span className="text-xs text-outline">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default FilterPanel;
```

## 5. EventDetailPage (Full Example)

```jsx
// pages/EventDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TopNav from '../components/layout/TopNav';
import EventSchedule from '../components/sections/EventSchedule';
import LocationMap from '../components/sections/LocationMap';
import LiveChat from '../components/sections/LiveChat';
import Button from '../components/common/Button';
import eventService from '../services/eventService';

const EventDetailPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const data = await eventService.getEventById(id);
        setEvent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-screen">Error: {error}</div>;
  if (!event) return <div className="flex items-center justify-center h-screen">Not found</div>;

  return (
    <div className="bg-surface text-on-surface">
      <TopNav />

      <main className="pt-16 pb-24 md:pb-0 md:pr-[320px]">
        {/* Hero Gallery */}
        <section className="p-6 grid grid-cols-12 gap-4 h-[600px]">
          <div className="col-span-12 md:col-span-8 relative overflow-hidden rounded-xl">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8">
              <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-none mb-2">
                {event.title}
              </h1>
              <p className="text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                {event.location}
              </p>
            </div>
          </div>

          {/* Secondary Images */}
          <div className="hidden md:grid col-span-4 grid-rows-2 gap-4">
            {event.images?.slice(1, 3).map((img, idx) => (
              <div key={idx} className="rounded-xl overflow-hidden relative">
                <img src={img} alt={`Event ${idx + 2}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </section>

        {/* Content Grid */}
        <div className="px-6 max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-12">
            {/* Description */}
            <section>
              <label className="text-[0.75rem] font-bold tracking-widest uppercase text-on-surface-variant mb-4 block">
                The Atmosphere
              </label>
              <p className="text-lg text-on-surface/90 leading-relaxed font-light">
                {event.description}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {event.categories?.map(cat => (
                  <span
                    key={cat}
                    className="px-4 py-2 rounded-full bg-surface-container-high text-primary border border-outline-variant/20 text-sm"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </section>

            {/* Schedule */}
            <EventSchedule schedule={event.schedule} />
          </div>

          {/* Right Column - Sticky */}
          <div className="space-y-8">
            <LocationMap location={event.location} />
            
            {/* RSVP Card */}
            <div className="sticky top-24 bg-surface-container-high p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Tickets starting at
                </span>
                <div className="text-3xl font-black text-primary">${event.price}</div>
              </div>
              <Button variant="primary" fullWidth size="lg">
                Secure Entry
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar Chat - Desktop Only */}
      <LiveChat eventId={event.id} className="hidden md:block" />
    </div>
  );
};

export default EventDetailPage;
```

## 6. Tailwind Config Snippet

```js
// tailwind.config.js - COLOR SYSTEM
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary (Purple)
        primary: '#d2bbff',
        'primary-container': '#7c3aed',
        'on-primary': '#3f008e',
        'on-primary-fixed': '#25005a',
        'on-primary-container': '#ede0ff',
        
        // Surface (Dark)
        surface: '#131313',
        'surface-bright': '#393939',
        'surface-dim': '#131313',
        'surface-container-lowest': '#0e0e0e',
        'surface-container-low': '#1c1b1b',
        'surface-container': '#201f1f',
        'surface-container-high': '#2a2a2a',
        'surface-container-highest': '#353534',
        'on-surface': '#e5e2e1',
        'on-surface-variant': '#ccc3d8',
        
        // Tertiary (Pink/Rose)
        tertiary: '#ffb0cd',
        'tertiary-container': '#bf2076',
        'on-tertiary': '#640039',
        
        // Secondary (Purple)
        secondary: '#ddb7ff',
        'secondary-container': '#6f00be',
        'on-secondary': '#490080',
        
        // Utility
        outline: '#958da1',
        'outline-variant': '#4a4455',
        error: '#ffb4ab'
      },
      fontFamily: {
        headline: ['Manrope'],
        body: ['Manrope'],
        label: ['Manrope']
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px'
      }
    }
  }
};
```

## 7. Custom Hooks

```jsx
// hooks/useEvents.js
import { useState, useEffect } from 'react';
import eventService from '../services/eventService';

export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await eventService.getEvents();
        setEvents(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return { events, loading, error };
}

// hooks/useFilters.js
import { useState, useCallback } from 'react';

export function useFilters(initialFilters = {}) {
  const [filters, setFilters] = useState({
    distance: 25,
    timeline: 'tonight',
    vibeTiming: ['prime-evening'],
    categories: [],
    ...initialFilters
  });

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      distance: 25,
      timeline: 'tonight',
      vibeTiming: ['prime-evening'],
      categories: []
    });
  }, []);

  return { filters, updateFilter, resetFilters };
}
```

---

Estos ejemplos muestran:
- ✅ Componentes reutilizables con props bien definidos
- ✅ Uso correcto de Tailwind classes personalizadas
- ✅ Estados locales y efectos secundarios
- ✅ Manejo de loading, errors
- ✅ Interactividad con handlers
- ✅ Accesibilidad con ARIA (en buttons)
- ✅ Responsive design (md: breakpoints)
- ✅ Animaciones y transiciones

