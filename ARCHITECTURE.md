# Arquitectura QueSale Backend

## 📐 Visión General de la Arquitectura

QueSale Backend sigue una **arquitectura de tres capas** diseñada para escalabilidad, mantenibilidad y separación de responsabilidades:

```
┌─────────────────────────────────────────┐
│     HTTP / WebSocket Clients            │
│   (Android, Web, iOS futuro)            │
└────────────────┬────────────────────────┘
                 │
         ┌───────▼────────┐
         │  EXPRESS.JS    │
         │   Middleware   │
         │   & Routing    │
         └───────┬────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼────┐  ┌───▼────┐  ┌───▼────┐
│ Auth   │  │ Event  │  │Ticket  │
│Service │  │Service │  │Service │
└───┬────┘  └───┬────┘  └───┬────┘
    │           │           │
└───┴───────────┴───────────┘
    │
┌───▼──────────────────┐
│ Models (Queries)     │
│ - UserModel          │
│ - EventModel         │
│ - TicketModel        │
└───┬──────────────────┘
    │
┌───▼──────────────────┐
│   MySQL Database     │
└──────────────────────┘
```

## 🔧 Componentes Principales

### 1. **Layer de Presentación (HTTP/WebSocket)**

**Express.js Routes:**
- `/api/auth/*` - Autenticación
- `/api/users/*` - Gestión de usuarios
- `/api/events/*` - Gestión de eventos
- `/api/tickets/*` - Gestión de entradas

**WebSocket (Socket.io):**
- Real-time chat por evento
- Typing indicators
- User presence tracking

### 2. **Layer de Middleware**

**Responsabilidades:**
- Autenticación (JWT, Firebase)
- Validación de datos
- Manejo de errores
- Logging
- CORS, Helmet (seguridad)

**Middleware Principales:**
```javascript
// Flujo de una solicitud
1. helmet() - Security headers
2. cors() - CORS
3. express.json() - Parse JSON
4. requestLogger - Log request
5. paginationMiddleware - Pagination
6. authenticateToken - JWT verification
7. handleValidationErrors - Validate input
8. Controller - Handle request
9. errorHandler - Handle errors
```

### 3. **Layer de Controladores**

Los controladores son **handlers de rutas** que:
- Reciben peticiones HTTP
- Validan input básico
- Llaman servicios
- Retornan respuestas

**Ejemplo:**
```javascript
// EventController.getEvents()
export class EventController {
  static async getEvents(req, res, next) {
    try {
      // req.pagination viene del middleware
      // req.query tiene filters
      const result = await EventService.getEvents(
        req.pagination,
        filters
      );
      sendPaginated(res, result.events, ...);
    } catch (error) {
      next(error); // Pasa al error handler
    }
  }
}
```

### 4. **Layer de Servicios**

Los servicios contienen **toda la lógica de negocio**:
- Validaciones de negocio
- Llamadas a múltiples modelos
- Transacciones
- Decisiones de flujo

**Servicios:**
- `AuthService` - Registro, login, verificación
- `UserService` - Profiles, intereses
- `EventService` - Crear, buscar, filtrar eventos
- `TicketService` - Compra, validación

**Ejemplo:**
```javascript
// EventService.createEvent()
static async createEvent(eventData, organizerId, userId) {
  // Generar ID único
  const eventId = generateId();
  
  // Crear evento en BD
  const event = await EventModel.create({...});
  
  // Asignar intereses
  if (eventData.interestIds) {
    await EventModel.setInterests(eventId, eventData.interestIds);
  }
  
  return event;
}
```

### 5. **Layer de Modelos**

Los modelos son la **interfaz con la BD**:
- Métodos CRUD
- Queries SQL
- No contienen lógica de negocio

**Modelos:**
- `UserModel` - users, users_interests
- `EventModel` - events, events_interests  
- `TicketModel` - tickets
- `OrganizerModel` - organizer, organizer_admins, organizer_followers
- `FeaturedEventModel` - featured_events

**Ejemplo:**
```javascript
// EventModel.getAll()
static async getAll(limit, offset, filters = {}) {
  let query = 'SELECT * FROM events WHERE 1=1';
  const params = [];
  
  if (filters.category) {
    query += ' AND id_event IN (SELECT id_event FROM events_interests...)';
    params.push(filters.category);
  }
  
  query += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  return await executeQuery(query, params);
}
```

## 🔄 Flujos de Datos

### Flujo 1: Crear Evento

```
POST /api/events
    ↓
[Middleware]
  - helmet (security headers)
  - cors
  - json parser
  - auth (JWT verification)
  - validators (schema validation)
    ↓
[EventController.createEvent()]
  - Extract userId from req.user
  - Extract event data from req.body
    ↓
[EventService.createEvent()]
  - Generate unique ID
  - Validate business rules
  - Call EventModel.create()
  - Call EventModel.setInterests()
    ↓
[EventModel]
  - INSERT INTO events (...)
  - INSERT INTO events_interests (...)
    ↓
[MySQL Database]
  - Execute queries
    ↓
[Response] 201 Created
{
  "success": true,
  "data": { event }
}
```

### Flujo 2: WebSocket Chat

```
Client connects with JWT token
    ↓
[Socket.io Auth Middleware]
  - Verify JWT
  - Extract userId
    ↓
socket.on('join-event', eventId)
    ↓
socket.join('event-{eventId}')
Broadcast 'user-joined' to room
    ↓
socket.on('send-message', {eventId, message})
    ↓
Validate message
Broadcast 'new-message' to all users in room
    ↓
socket.on('disconnect')
    ↓
Remove user from all rooms
Broadcast 'user-left' to rooms
```

### Flujo 3: Comprar Entrada

```
POST /api/tickets/purchase
    ↓
[TicketController.purchaseTicket()]
    ↓
[TicketService.purchaseTicket()]
  - Verify event exists
  - Check user doesn't already have ticket
  - Generate UUID
  - Generate QR code
    ↓
[TicketModel.create()]
  - INSERT INTO tickets (...)
    ↓
[Response] 201 Created
{
  "success": true,
  "data": {
    "ticket": {...},
    "qrCode": "data:image/png;base64,..."
  }
}
```

## 🗂️ Estructura de Archivos Detallada

```
src/
│
├── config/
│   ├── database.js          # Connection pool MySQL
│   ├── firebase.js          # Firebase Admin SDK
│   └── index.js             # Centralized config
│
├── middleware/
│   ├── errorHandler.js      # Global error handler
│   ├── auth.js              # JWT & Firebase auth
│   └── validators.js        # Validation & pagination
│
├── models/
│   ├── User.js              # User model & queries
│   ├── Event.js             # Event model & queries
│   └── Ticket.js            # Ticket model & queries
│
├── services/
│   ├── AuthService.js       # Auth logic
│   ├── UserService.js       # User logic
│   ├── EventService.js      # Event logic
│   └── TicketService.js     # Ticket logic
│
├── controllers/
│   ├── AuthController.js    # Auth routes handlers
│   ├── UserController.js    # User routes handlers
│   ├── EventController.js   # Event routes handlers
│   └── TicketController.js  # Ticket routes handlers
│
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── userRoutes.js        # User endpoints
│   ├── eventRoutes.js       # Event endpoints
│   └── ticketRoutes.js      # Ticket endpoints
│
├── utils/
│   ├── response.js          # Response helpers
│   ├── jwt.js               # JWT utilities
│   ├── generators.js        # ID, QR generators
│   └── formatters.js        # Data formatters
│
├── validators/
│   ├── authValidator.js     # Auth validation schemas
│   └── eventValidator.js    # Event validation schemas
│
├── websocket/
│   └── chatSocket.js        # Socket.io setup & handlers
│
└── server.js                # App entry point
```

## 🔐 Seguridad

### Autenticación

1. **JWT Tokens**
   - Generados al login
   - Incluyen: userId, email, username
   - Expiran en 7 días (configurable)
   - Verificados en middleware

2. **Firebase Auth**
   - OAuth con Google
   - Gestiona contraseñas de forma segura
   - Verifica ID tokens

### Autorización

- `authenticateToken` - Requiere JWT válido
- `optionalAuthenticateToken` - JWT opcional
- `authorizeRole` - Valida roles específicos

### Protecciones Adicionales

- **Helmet.js** - Security headers
- **CORS** - Control de origen
- **SQL Injection** - Parametrized queries
- **XSS** - JSON parser seguro
- **Rate limiting** - (TODO implementar)

## 📊 Base de Datos

### Esquema Relacional

```
users (1) ──────────> (n) events
  ├─ id_user
  ├─ username
  ├─ email
  ├─ verified
  └─ created_at

events (n) <────────── (1) organizer
  ├─ id_event
  ├─ title
  ├─ description
  ├─ date
  ├─ ubication
  ├─ id_organizer
  └─ id_creator

interests (n) ◄──────► (n) events_interests
interests (n) ◄──────► (n) users_interests

tickets (n) ────────► (1) events
tickets (n) ────────► (1) users
  ├─ id_ticket
  ├─ uuid
  ├─ id_event
  ├─ id_user
  ├─ state (1=activo, 2=usado, 3=cancelado)
  └─ buy_date

posts (n) ────────────► (1) events
comments (n) ─────────► (1) posts
```

### Índices Principales

- `users.email` - UNIQUE
- `users.username` - UNIQUE
- `tickets.uuid` - UNIQUE
- `events.id_organizer` - INDEX
- `tickets.id_user` - INDEX
- `tickets.id_event` - INDEX

## 🚀 Escalabilidad

### Diseño para Crecimiento

1. **Stateless Servers**
   - Cada instancia del backend es independiente
   - Fácil de escalar horizontalmente
   - Usa load balancer

2. **Database Optimization**
   - Índices en queries frecuentes
   - Connection pooling
   - Query optimization

3. **Real-time Scalability**
   - Socket.io con Redis adapter (futuro)
   - Para múltiples instancias del servidor

4. **Cache Layer** (futuro)
   - Redis para eventos populares
   - Session storage distribuido

5. **Media Storage** (futuro)
   - Migrar a S3/Cloudinary
   - CDN para imágenes

### Limitaciones Actuales

- Single database instance
- Single server deployment
- No distributed caching
- No message queue

### Plan de Escalado Futuro

```
# MVP (Current)
- 1 Node server
- 1 MySQL instance
- Local storage

# Growth Phase
- 2-3 Node servers + Load Balancer
- MySQL replication (master-slave)
- Redis for caching
- S3 for media

# Scale Phase  
- 5+ Node servers
- MySQL cluster
- Distribution network
- Message queues (RabbitMQ/Kafka)
```

## 🧪 Testing

(Próximas mejoras)

- Unit tests para servicios
- Integration tests para API
- Load testing
- Security testing

## 📈 Performance

**Benchmarks esperados:**
- Request response time: < 200ms
- Database queries: < 50ms
- Real-time messages: < 100ms latency
- WebSocket connection: < 500ms

**Optimizaciones implementadas:**
- Connection pooling
- Query optimization
- Pagination
- Lazy loading de relaciones

## 🔄 CI/CD

(Próximas mejoras)

- GitHub Actions para tests
- Automated deployment
- Environment management

---

**Última actualización:** Abril 2024  
**Versión:** 1.0.0
