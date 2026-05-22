# 🚀 INICIO RÁPIDO - QueSale Backend

## ¿Qué fue creado?

Se ha construido un **backend Node.js profesional y escalable** para QueSale con:

✅ **Arquitectura de 3 capas** (Controllers → Services → Models)  
✅ **API REST** con endpoints para Auth, Users, Events, Tickets  
✅ **WebSocket** para chat en tiempo real via Socket.io  
✅ **Autenticación** con JWT + Firebase Auth  
✅ **Base de datos MySQL** con modelo relacional optimizado  
✅ **Documentación completa** (README, ARCHITECTURE, EXAMPLES)  

## 📦 Estructura de Carpetas

```
d:\Programacion\QueSale\backend\
├── src/
│   ├── config/            # Base de datos, Firebase, configuración
│   ├── middleware/        # Auth, validación, errores
│   ├── models/            # User, Event, Ticket models
│   ├── services/          # Auth, User, Event, Ticket services
│   ├── controllers/       # Auth, User, Event, Ticket controllers
│   ├── routes/            # authRoutes, userRoutes, eventRoutes, ticketRoutes
│   ├── utils/             # response, jwt, generators, formatters
│   ├── middleware/        # errorHandler, auth, validators
│   ├── websocket/         # chatSocket para Socket.io
│   └── server.js          # Punto de entrada ⭐
├── public/uploads/        # Almacenamiento de archivos
├── .env.example           # Plantilla de variables de entorno ⭐
├── .gitignore             # Archivos a ignorar
├── package.json           # Dependencias ⭐
├── vite.config.js         # Configuración Vite
├── schema.sql             # Schema de BD mejorado ⭐
├── bbdd.sql               # Schema original
├── README.md              # Documentación principal ⭐
├── ARCHITECTURE.md        # Detalles de arquitectura ⭐
├── EXAMPLES.md            # Ejemplos de requests ⭐
├── API_RESPONSES.md       # Códigos y respuestas
├── TODO.md                # Roadmap de mejoras
└── .eslintrc.json         # Configuración ESLint
```

## 🎯 Próximos Pasos

### 1. Configurar Environment

```bash
# Ir a la carpeta backend
cd d:\Programacion\QueSale\backend

# Copiar plantilla .env
copy .env.example .env

# Editar .env con tus credenciales:
# - DB_HOST, DB_USER, DB_PASSWORD
# - JWT_SECRET (generar uno fuerte)
# - FIREBASE_PROJECT_ID (si usarás OAuth)
```

### 2. Instalar Dependencias

```bash
cd d:\Programacion\QueSale\backend
npm install
```

### 3. Crear Base de Datos

```bash
# Opción A: Usar schema.sql (recomendado, incluye mejoras)
mysql -u root -p quesale < schema.sql

# Opción B: Usar bbdd.sql (original)
mysql -u root -p mydb < bbdd.sql
```

### 4. Iniciar Servidor

```bash
# Modo desarrollo (con watch)
npm run dev

# Resultado esperado:
# ✅ Server running on port 3000
# 📍 Environment: development
# 🌐 API URL: http://localhost:3000
```

### 5. Verificar que funciona

```bash
# Health check
curl http://localhost:3000/health

# Debe retornar:
# {"success":true,"message":"Server is running"}
```

## 🧪 Pruebas Iniciales

### API Básica

```bash
# Registrarse
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPass123!",
    "confirmPassword": "TestPass123!"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'

# Listar eventos
curl http://localhost:3000/api/events
```

### WebSocket

Ver ejemplos en `EXAMPLES.md` → Sección "WebSocket - Chat"

## 📚 Documentación

| Archivo | Contenido |
|---------|-----------|
| [README.md](./README.md) | Guía principal, endpoints, setup |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Diseño de arquitectura, flujos de datos |
| [EXAMPLES.md](./EXAMPLES.md) | Ejemplos con cURL, Postman, JavaScript |
| [API_RESPONSES.md](./API_RESPONSES.md) | Códigos HTTP, mensajes, formatos |
| [TODO.md](./TODO.md) | Roadmap de features futuras |

## 🔧 Configuración Firebase (Opcional)

Si quieres usar OAuth con Google:

1. Ir a [Firebase Console](https://console.firebase.google.com)
2. Crear proyecto
3. Descargar `serviceAccountKey.json`
4. Copiar credenciales a `.env`

Ver instrucciones completas en README.md → Configuración → Firebase

## 🛠️ Tecnologías Utilizadas

| Stack | Versión | Propósito |
|-------|---------|-----------|
| **Node.js** | 18+ | Runtime |
| **Express.js** | 4.18 | Web framework |
| **MySQL2** | 3.6 | Database client |
| **Socket.io** | 4.7 | WebSocket real-time |
| **JWT** | 9.1 | Autenticación |
| **Firebase Admin** | 12.0 | Auth / OAuth |
| **Vite** | 5.0 | Build tool |

## 📊 Base de Datos

### Tablas Principales

- **users** - Usuarios registrados
- **events** - Eventos creados  
- **tickets** - Entradas de usuarios
- **posts** - Mensajes en muro de evento
- **comments** - Comentarios en posts
- **reviews** - Reseñas de eventos
- **organizer** - Organizadores
- **interests** - Categorías/intereses

Todas con índices y constraints optimizados.

Ver esquema completo en: `schema.sql`

## 🚀 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Inicia con watch

# Producción
npm run build            # Build para producción
npm start                # Inicia servidor

# Lint
npm run lint             # Ejecutar eslint
npm run lint -- --fix    # Arreglar automáticamente

# Database
mysql -u root -p < schema.sql    # Crear BD
mysql -u root -p quesale         # Acceder a BD
```

## 🔐 Seguridad

- ✅ JWT tokens seguros
- ✅ Firebase Auth para OAuth
- ✅ CORS configurado
- ✅ Helmet para headers
- ✅ SQL injection protection (parametrized queries)
- ✅ Input validation
- ✅ Error handling seguro

**TODO futuro:** Rate limiting, 2FA, más validaciones

## 📱 Integración con Clientes

### Android (Java)

```kotlin
// El backend expone API REST en http://localhost:3000/api/*
// Usar Retrofit o Volley para requests

// Para WebSocket
import io.socket:socket.io-client-java:2.1.0
```

### React Web

```javascript
// API requests
import axios from 'axios'
const api = axios.create({
  baseURL: 'http://localhost:3000/api'
})

// WebSocket
import io from 'socket.io-client'
const socket = io('http://localhost:3000')
```

Ver ejemplos completos en `EXAMPLES.md`

## 🐛 Troubleshooting

### "Port 3000 already in use"
```bash
# Cambiar puerto en .env
PORT=3001
```

### "Database connection error"
```bash
# Verificar:
# 1. MySQL running: sudo service mysql status
# 2. Credenciales en .env correctas
# 3. Base de datos existe
```

### "Invalid token"
```bash
# JWT_SECRET debe ser diferente en .env
# Regenerar tokens después de cambiar
```

## 📞 Support

- 📖 Leer documentación primero
- 🔍 Revisar EXAMPLES.md para casos similares
- 💬 Chequear logs del servidor
- 📋 Ver TODO.md para features en development

## ✨ Características Implementadas

### Core
- [x] Autenticación JWT + Firebase
- [x] CRUD de usuarios
- [x] CRUD de eventos
- [x] Compra de tickets con QR
- [x] Chat WebSocket por evento
- [x] Filtros de eventos (categoría, ubicación, fecha)
- [x] Intereses de usuario
- [x] Eventos guardados

### Infrastructure
- [x] Database connection pooling
- [x] Middleware de validación
- [x] Error handling centralizado
- [x] Request/response formatting
- [x] Pagination
- [x] Security headers (Helmet)
- [x] CORS configuration

### Documentation
- [x] README completo
- [x] Architecture guide
- [x] API examples
- [x] Response codes
- [x] TODO roadmap
- [x] This quick start guide

## 🎓 Próxima Etapa Recomendada

1. **Testing** - Escribir tests unitarios
2. **Organizers** - Implementar módulo de organizadores
3. **Featured Events** - Sistema de eventos destacados
4. **Notifications** - Recordatorios por email/push
5. **Analytics** - Métricas básicas

Ver TODO.md para roadmap completo.

---

**Backend listo para usar y escalar. ¡A desarrollar!** 🚀
