# Ejemplos de Requests

> Ejemplos de cómo usar la API QueSale

## Instalación de Herramientas

### Usando cURL

```bash
# Windows
choco install curl

# macOS
brew install curl

# Linux
sudo apt-get install curl
```

### Usando Postman

1. Descargar [Postman](https://www.postman.com/downloads)
2. Importar collection: File → Import → URL
3. O crear requests manualmente

## 🔐 Autenticación

### 1. Registro

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "SecurePassword123!",
    "confirmPassword": "SecurePassword123!"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id_user": "550e8400-e29b-41d4-a716-446655440000",
      "username": "johndoe",
      "email": "user@example.com",
      "verified": 0
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Guardar token:**
```bash
# El token debe usarse en todos los requests protegidos
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

### 3. Login con Firebase

```bash
curl -X POST http://localhost:3000/api/auth/login-firebase \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE..."
  }'
```

## 👤 Usuarios

### Obtener Perfil

```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Actualizar Perfil

```bash
curl -X PUT http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johnsmith",
    "email": "newemail@example.com"
  }'
```

### Establecer Intereses

```bash
curl -X POST http://localhost:3000/api/users/interests \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "interestIds": [1, 2, 3, 4]
  }'
```

### Eventos Guardados

```bash
curl -X GET "http://localhost:3000/api/users/saved-events?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Perfil Público

```bash
curl -X GET http://localhost:3000/api/users/550e8400-e29b-41d4-a716-446655440000/profile
```

## 🎭 Eventos

### Listar Eventos

```bash
# Sin filtros
curl -X GET "http://localhost:3000/api/events?page=1&limit=20"

# Con filtros
curl -X GET "http://localhost:3000/api/events?page=1&limit=20&category=anime&location=AMBA&dateFrom=2024-01-01"

# Con token
curl -X GET "http://localhost:3000/api/events" \
  -H "Authorization: Bearer $TOKEN"
```

### Crear Evento

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Anime Expo 2024",
    "description": "La exposición de anime más grande del año",
    "date": "2024-02-15T18:00:00Z",
    "location": "Centro de Convenciones, Buenos Aires",
    "organizerId": "org-uuid-here",
    "interestIds": [1, 2, 3]
  }'
```

### Obtener Detalles de Evento

```bash
curl -X GET http://localhost:3000/api/events/event-uuid \
  -H "Authorization: Bearer $TOKEN"
```

### Eventos Cercanos

```bash
curl -X GET "http://localhost:3000/api/events/nearby?location=AMBA&page=1&limit=20"
```

### Buscar Eventos

```bash
curl -X GET "http://localhost:3000/api/events/search?category=cosplay&location=AMBA&page=1&limit=20"
```

### Actualizar Evento

```bash
curl -X PUT http://localhost:3000/api/events/event-uuid \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Anime Expo 2024 - Updated",
    "description": "Nueva descripción",
    "date": "2024-02-20T18:00:00Z"
  }'
```

### Eliminar Evento

```bash
curl -X DELETE http://localhost:3000/api/events/event-uuid \
  -H "Authorization: Bearer $TOKEN"
```

## 🎫 Tickets

### Comprar Entrada

```bash
curl -X POST http://localhost:3000/api/tickets/purchase \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "event-uuid"
  }'

# Response incluye QR code:
{
  "id_ticket": "ticket-uuid",
  "uuid": "TICKET_CODE_123ABC",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEU..."
}
```

### Mis Tickets

```bash
curl -X GET "http://localhost:3000/api/tickets/my-tickets?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Detalles de Ticket

```bash
curl -X GET http://localhost:3000/api/tickets/TICKET_CODE_123ABC/details \
  -H "Authorization: Bearer $TOKEN"
```

### Validar Ticket (Entrada)

```bash
# El organizador valida tickets al entrada
curl -X POST http://localhost:3000/api/tickets/TICKET_CODE_123ABC/validate \
  -H "Authorization: Bearer $TOKEN"

# Response:
{
  "success": true,
  "message": "Ticket validated successfully",
  "data": {
    "id_ticket": "uuid",
    "state": 2,
    "validated_at": "2024-01-15T20:30:00Z"
  }
}
```

### Cancelar Ticket

```bash
curl -X DELETE http://localhost:3000/api/tickets/ticket-uuid \
  -H "Authorization: Bearer $TOKEN"
```

### Asistentes de Evento

```bash
curl -X GET "http://localhost:3000/api/tickets/event/event-uuid/attendees?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

## 💬 WebSocket - Chat

### Conectarse

```javascript
import io from 'socket.io-client';

const token = localStorage.getItem('token');

const socket = io('http://localhost:3000', {
  auth: {
    token: token
  }
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});
```

### Unirse a un Evento

```javascript
socket.emit('join-event', 'event-uuid');

socket.on('user-joined', (data) => {
  console.log(`${data.userId} joined. Total users: ${data.totalUsers}`);
});
```

### Enviar Mensaje

```javascript
socket.emit('send-message', {
  eventId: 'event-uuid',
  message: '¡Este evento está increíble!',
  messageType: 'chat'
});

socket.on('new-message', (msg) => {
  console.log(`${msg.userId}: ${msg.message}`);
});
```

### Escribiendo (Typing Indicator)

```javascript
// Usuario está escribiendo
socket.emit('typing', 'event-uuid');

// Otros usuarios ven:
socket.on('user-typing', (data) => {
  console.log(`${data.userId} is typing...`);
});

// Usuario paró de escribir
socket.emit('stop-typing', 'event-uuid');

socket.on('user-stop-typing', (data) => {
  console.log(`${data.userId} stopped typing`);
});
```

### Dejar Evento

```javascript
socket.emit('leave-event', 'event-uuid');

socket.on('user-left', (data) => {
  console.log(`${data.userId} left. Total users: ${data.totalUsers}`);
});
```

### Info de Sala

```javascript
socket.emit('get-room-info', 'event-uuid');

socket.on('room-info', (data) => {
  console.log(`${data.eventId}: ${data.userCount} users`);
  console.log('Users:', data.users);
});
```

## 📋 Colecciones Postman

Descargar la colección completa:

```json
{
  "info": {
    "name": "QueSale API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "http://localhost:3000/api/auth/register"
          }
        }
      ]
    }
  ]
}
```

## 🧪 Automatización

### Script de Testing (Node.js)

```javascript
// test.js
const http = require('http');

async function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve(JSON.parse(data));
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test() {
  // Register
  const reg = await request('POST', '/api/auth/register', {
    email: 'test@example.com',
    username: 'testuser',
    password: 'TestPassword123!',
    confirmPassword: 'TestPassword123!'
  });
  
  const token = reg.data.token;
  console.log('✅ Registered:', reg.data.user.username);

  // Get profile
  const profile = await request('GET', '/api/users/profile', null, token);
  console.log('✅ Profile:', profile.data.username);

  // Create event
  const event = await request('POST', '/api/events', {
    title: 'Test Event',
    description: 'Test',
    date: new Date().toISOString(),
    location: 'Buenos Aires',
    organizerId: 'test-org'
  }, token);
  console.log('✅ Event created:', event.data.id_event);
}

test().catch(console.error);
```

Ejecutar:
```bash
node test.js
```

## 📊 Respuestas Esperadas

### Success Response
```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Events retrieved",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "hasMore": true
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "details": null
  }
}
```

---

**Tip:** Guardar la colección en `.postman_collection.json` para compartir con el equipo.
