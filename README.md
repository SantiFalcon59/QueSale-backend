# QueSale Backend API

> Servidor backend escalable para QueSale - Plataforma de descubrimiento de eventos locales

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Inicio Rápido](#inicio-rápido)
- [Arquitectura](#arquitectura)
- [API Endpoints](#api-endpoints)
- [WebSocket Events](#websocket-events)
- [Autenticación](#autenticación)
- [Configuración](#configuración)

## 📝 Descripción

QueSale Backend es un servidor Node.js + Express diseñado para proporcionar una API REST robusta y escalable para:

- **Gestión de eventos** con filtros avanzados (categoría, ubicación, fecha)
- **Autenticación** con JWT y Firebase Auth
- **Sistema de tickets** con generación de QR
- **Chat en tiempo real** de eventos via WebSocket
- **Perfiles de usuario** con intereses personalizados

### Características Principales

✅ API REST bien estructurada  
✅ Autenticación segura con JWT + Firebase  
✅ WebSocket para chat en tiempo real  
✅ Modelos relaciones en MySQL  
✅ Middleware de validación y seguridad  
✅ Generación de QR para tickets  
✅ Manejo robusto de errores  

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js 18+
- npm o yarn
- MySQL 8.0+
- Firebase Account (opcional, para OAuth)

### Instalación

1. **Clonar/crear el proyecto**
   ```bash
   cd d:\Programacion\QueSale\backend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   Editar `.env` con tus credenciales

4. **Crear base de datos**
   ```bash
   mysql -u root < bbdd.sql
   ```

5. **Iniciar servidor en desarrollo**
   ```bash
   npm run dev
   ```

6. **Servidor disponible en**
   ```
   http://localhost:3000
   ```

## 🏗 Arquitectura

### Estructura de Carpetas

```
src/
├── config/           # Configuración (DB, Firebase, env)
├── controllers/      # Handlers de rutas
├── middleware/       # Middleware (auth, validación, errores)
├── models/           # Modelos de datos
├── routes/           # Definición de rutas
├── services/         # Lógica de negocio
├── utils/            # Utilidades (JWT, formatters, generators)
├── validators/       # Validadores específicos
├── websocket/        # Configuración WebSocket
└── server.js         # Punto de entrada

public/uploads/      # Archivos subidos (media)
```

### Flujo de Datos

```
Request → Middleware (Auth, Validación) 
       → Router 
       → Controller (req validation)
       → Service (business logic)
       → Model (database)
       → Response
```

### Componentes Principales

#### 1. **Database Layer** (`src/config/database.js`)
- Pool de conexiones MySQL
- Métodos para ejecutar queries
- Transacciones

#### 2. **Authentication** (`src/middleware/auth.js`)
- JWT tokens
- Firebase Auth
- OAuth Google

#### 3. **Services** (`src/services/`)
- `AuthService`: Registro, login, verificación
- `UserService`: Perfiles, intereses
- `EventService`: Creación, búsqueda, filtros
- `TicketService`: Compra, validación de entradas
- `OrganizerService`: Gestión de organizadores, admins, analytics

#### 4. **WebSocket** (`src/websocket/chatSocket.js`)
- Event rooms por evento
- Mensajes en tiempo real
- Typing indicators
- User presence

## 📡 API Endpoints

### Authentication

#### Registro
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "securepassword123",
  "confirmPassword": "securepassword123"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Login con Firebase
```http
POST /api/auth/login-firebase
Content-Type: application/json

{
  "idToken": "firebase_id_token"
}
```

### Usuarios

#### Obtener perfil
```http
GET /api/users/profile
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id_user": "uuid",
    "username": "username",
    "email": "user@example.com",
    "verified": true,
    "interests": [...]
  }
}
```

#### Actualizar perfil
```http
PUT /api/users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

#### Establecer intereses
```http
POST /api/users/interests
Authorization: Bearer {token}
Content-Type: application/json

{
  "interestIds": [1, 2, 3, 4]
}
```

#### Eventos guardados
```http
GET /api/users/saved-events?page=1&limit=20
Authorization: Bearer {token}
```

### Eventos

#### Listar eventos
```http
GET /api/events?page=1&limit=20&category=anime&location=AMBA&dateFrom=2024-01-01
Authorization: Bearer {token} (opcional)

Response:
{
  "success": true,
  "data": [
    {
      "id_event": "uuid",
      "title": "Event Title",
      "description": "...",
      "date": "2024-01-15T19:00:00Z",
      "ubication": "Location",
      "attendeesCount": 45,
      "interests": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "hasMore": true
  }
}
```

#### Crear evento
```http
POST /api/events
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Anime Convention 2024",
  "description": "Annual anime gathering",
  "date": "2024-02-15T18:00:00Z",
  "location": "Buenos Aires",
  "organizerId": "org_uuid",
  "interestIds": [1, 2]
}
```

#### Obtener detalles de evento
```http
GET /api/events/{eventId}
Authorization: Bearer {token} (opcional)
```

#### Eventos cercanos
```http
GET /api/events/nearby?location=AMBA&page=1&limit=20
```

### Tickets

#### Comprar entrada
```http
POST /api/tickets/purchase
Authorization: Bearer {token}
Content-Type: application/json

{
  "eventId": "event_uuid"
}

Response:
{
  "success": true,
  "data": {
    "id_ticket": "uuid",
    "uuid": "TICKET_CODE",
    "id_event": "event_uuid",
    "id_user": "user_uuid",
    "status": 1,
    "purchaseDate": "2024-01-15T20:30:00Z",
    "qrCode": "data:image/png;base64,..."
  }
}
```

#### Mis tickets
```http
GET /api/tickets/my-tickets?page=1&limit=20
Authorization: Bearer {token}
```

#### Detalles de ticket
```http
GET /api/tickets/{ticketUuid}/details
Authorization: Bearer {token}
```

#### Validar ticket (entrada)
```http
POST /api/tickets/{ticketUuid}/validate
Authorization: Bearer {token}
```

#### Cancelar ticket
```http
DELETE /api/tickets/{ticketId}
Authorization: Bearer {token}
```

### Organizers

#### Crear organizador
```http
POST /api/organizers
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Tech Events Co",
  "description": "We organize tech conferences"
}

Response:
{
  "success": true,
  "data": {
    "id_organizer": "uuid",
    "name": "Tech Events Co",
    "description": "We organize tech conferences",
    "id_creator": "user_uuid",
    "followers_count": 0,
    "events_count": 0,
    "created_at": "2024-01-15T20:30:00Z"
  }
}
```

#### Obtener todos los organizadores
```http
GET /api/organizers?page=1&limit=20
```

#### Mis organizadores
```http
GET /api/organizers/me?page=1&limit=20
Authorization: Bearer {token}
```

#### Detalles de organizador
```http
GET /api/organizers/{organizerId}
```

#### Actualizar organizador
```http
PUT /api/organizers/{organizerId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Tech Events Co Updated",
  "description": "Updated description"
}
```

#### Eliminar organizador
```http
DELETE /api/organizers/{organizerId}
Authorization: Bearer {token}
```

#### Agregar admin a organizador
```http
POST /api/organizers/{organizerId}/admins
Authorization: Bearer {token}
Content-Type: application/json

{
  "adminId": "user_uuid",
  "role": "admin"  // "admin" | "editor" | "viewer"
}
```

#### Remover admin de organizador
```http
DELETE /api/organizers/{organizerId}/admins/{adminId}
Authorization: Bearer {token}
```

#### Obtener admins de organizador
```http
GET /api/organizers/{organizerId}/admins
Authorization: Bearer {token}
```

#### Seguir organizador
```http
POST /api/organizers/{organizerId}/follow
Authorization: Bearer {token}
```

#### Dejar de seguir organizador
```http
DELETE /api/organizers/{organizerId}/follow
Authorization: Bearer {token}
```

#### Obtener seguidores de organizador
```http
GET /api/organizers/{organizerId}/followers?page=1&limit=20
```

#### Eventos del organizador
```http
GET /api/organizers/{organizerId}/events?page=1&limit=20
```

#### Dashboard analytics del organizador
```http
GET /api/organizers/{organizerId}/dashboard
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "total_events": 5,
    "total_tickets": 250,
    "active_tickets": 180,
    "followers": 150,
    "reviews": 42,
    "avg_rating": 4.50
  }
}
```

### Featured Events (Monetización)

#### Obtener tiers de precios
```http
GET /api/featured/pricing

Response:
{
  "success": true,
  "data": {
    "level_1": {
      "level": 1,
      "name": "Featured - Basic",
      "price": 50,
      "duration_days": 7,
      "visibility": "Standard featured placement"
    },
    "level_2": {
      "level": 2,
      "name": "Featured - Premium",
      "price": 150,
      "duration_days": 14,
      "visibility": "Premium featured placement with push notification"
    }
  }
}
```

#### Crear featured event
```http
POST /api/featured
Authorization: Bearer {token}
Content-Type: application/json

{
  "eventId": "event-uuid",
  "level": 1,
  "organizerId": "org-uuid"
}

Response:
{
  "success": true,
  "data": {
    "featured": {
      "id_featured_event": "featured-uuid",
      "level": 1,
      "price": 50,
      "status": "pending"
    },
    "payment_required": {
      "amount": 50,
      "currency": "ARS",
      "featured_event_id": "featured-uuid"
    }
  }
}
```

#### Generar link de pago Mercado Pago
```http
POST /api/featured/:featuredEventId/payment-link
Authorization: Bearer {token}

{
  "organizerName": "Tech Events Co",
  "organizerEmail": "contact@techevents.com"
}

Response:
{
  "success": true,
  "data": {
    "payment_url": "https://www.mercadopago.com/payment/...",
    "expires_in": 3600
  }
}
```

#### Obtener eventos featured activos
```http
GET /api/featured/active?level=1

Response:
{
  "success": true,
  "data": [
    {
      "id_featured_event": "featured-uuid",
      "id_event": "event-uuid",
      "event_title": "React Conference",
      "level": 1,
      "status": "active"
    }
  ]
}
```

#### Mi eventos featured
```http
GET /api/featured/organizer/:organizerId?page=1&limit=20
Authorization: Bearer {token}
```

#### Cancelar featured event
```http
DELETE /api/featured/:featuredEventId
Authorization: Bearer {token}
```

#### Analytics de ingresos (admin)
```http
GET /api/featured/analytics/revenue?startDate=2024-01-01&endDate=2024-01-31

Response:
{
  "success": true,
  "data": {
    "total_featured": 45,
    "active_featured": 12,
    "total_revenue": 4500,
    "avg_price": 100,
    "unique_organizers": 25
  }
}
```

## 🔌 WebSocket Events

### Cliente → Servidor

#### Conectarse a evento
```javascript
socket.emit('join-event', 'event_uuid');
```

#### Enviar mensaje
```javascript
socket.emit('send-message', {
  eventId: 'event_uuid',
  message: 'Great event!',
  messageType: 'chat' // 'chat' | 'announcement' | 'question'
});
```

#### Escribiendo
```javascript
socket.emit('typing', 'event_uuid');
```

#### Dejar de escribir
```javascript
socket.emit('stop-typing', 'event_uuid');
```

#### Obtener info de sala
```javascript
socket.emit('get-room-info', 'event_uuid');
```

#### Dejar evento
```javascript
socket.emit('leave-event', 'event_uuid');
```

### Servidor → Cliente

#### Nuevo mensaje
```javascript
socket.on('new-message', (data) => {
  // {
  //   userId: 'user_uuid',
  //   message: 'text',
  //   messageType: 'chat',
  //   timestamp: Date,
  //   socketId: 'socket_id'
  // }
});
```

#### Usuario se unió
```javascript
socket.on('user-joined', (data) => {
  // { userId, totalUsers, timestamp }
});
```

#### Usuario se fue
```javascript
socket.on('user-left', (data) => {
  // { userId, totalUsers, timestamp }
});
```

#### Usuario escribiendo
```javascript
socket.on('user-typing', (data) => {
  // { userId, timestamp }
});
```

#### Usuario paró de escribir
```javascript
socket.on('user-stop-typing', (data) => {
  // { userId }
});
```

#### Info de sala
```javascript
socket.on('room-info', (data) => {
  // { eventId, userCount, users: [] }
});
```

## 🔐 Autenticación

### JWT Token

Los tokens JWT se incluyen en el header de autorización:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Estructura del payload JWT:
```json
{
  "id": "user_uuid",
  "email": "user@example.com",
  "username": "username",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Firebase Auth

Para usar Google OAuth:

1. Configura Firebase Project ID en `.env`
2. Descarga `serviceAccountKey.json` de Firebase Console
3. Configura las variables en `.env`
4. El cliente envía `idToken` desde Firebase SDK

## ⚙️ Configuración

### Variables de Entorno

Ver `.env.example` para todas las variables disponibles.

**Críticas:**
- `PORT`: Puerto del servidor (default: 3000)
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Conexión MySQL
- `JWT_SECRET`: Clave para firmar tokens
- `FIREBASE_PROJECT_ID`: ID del proyecto Firebase

### Base de Datos

El esquema SQL se proporciona en `bbdd.sql`. Para importar:

```bash
mysql -u root -p mydb < bbdd.sql
```

### CORS

Para clientes específicos, edita `CORS_ORIGIN` en `.env`:

```
CORS_ORIGIN=http://localhost:3000,http://localhost:5173,https://quesale.com
```

## 🧪 Ejemplos de Uso

### Cliente: JavaScript/Fetch

#### Registro
```javascript
const response = await fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    username: 'user',
    password: 'pass123',
    confirmPassword: 'pass123'
  })
});

const { data } = await response.json();
localStorage.setItem('token', data.token);
```

#### Obtener eventos
```javascript
const token = localStorage.getItem('token');
const response = await fetch(
  'http://localhost:3000/api/events?category=anime&location=AMBA',
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);

const { data } = await response.json();
```

### Cliente: WebSocket (Socket.io)

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'JWT_TOKEN_HERE'
  }
});

// Conectar a evento
socket.emit('join-event', 'event_uuid');

// Escuchar mensajes
socket.on('new-message', (msg) => {
  console.log(`${msg.userId}: ${msg.message}`);
});

// Enviar mensaje
socket.emit('send-message', {
  eventId: 'event_uuid',
  message: 'Great event!'
});
```

## 🚀 Deploy

### Producción

```bash
# Build
npm run build

# Start
npm start
```

### Docker (opcional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📚 Documentación Adicional

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Arquitectura detallada
- [ORGANIZERS.md](./docs/ORGANIZERS.md) - Sistema de organizadores
- [FEATURED_EVENTS.md](./docs/FEATURED_EVENTS.md) - Sistema de eventos destacados
- [MERCADOPAGO_INTEGRATION.md](./docs/MERCADOPAGO_INTEGRATION.md) - Integración de pagos
- [API_DETAILED.md](./docs/API_DETAILED.md) - Documentación completa de API
- [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) - Esquema de base de datos
- [WEBSOCKET.md](./docs/WEBSOCKET.md) - Guía de WebSocket

## 🤝 Contribuciones

Contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT License
