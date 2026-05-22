# API Response Codes y Mensajes

## Success Responses (2xx)

| Code | Status | Uso |
|------|--------|-----|
| 200 | OK | GET exitoso, actualización exitosa |
| 201 | Created | POST exitoso, recurso creado |
| 204 | No Content | DELETE exitoso |

## Client Errors (4xx)

| Code | Status | Significado |
|------|--------|-----------|
| 400 | Bad Request | Request inválido, validación fallida |
| 401 | Unauthorized | No autenticado o token inválido |
| 403 | Forbidden | Autenticado pero sin permisos |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Conflicto (ej: email duplicado) |

## Server Errors (5xx)

| Code | Status | Significado |
|------|--------|-----------|
| 500 | Internal Server Error | Error genérico del servidor |
| 503 | Service Unavailable | Servicio temporalmente no disponible |

## Ejemplos de Respuesta

### Success (200)
```json
{
  "success": true,
  "message": "Events retrieved successfully",
  "data": [...]
}
```

### Paginated (200)
```json
{
  "success": true,
  "message": "Events retrieved successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "hasMore": true
  }
}
```

### Created (201)
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": { "id_event": "uuid", ... }
}
```

### Validation Error (400)
```json
{
  "success": false,
  "error": {
    "message": "Validation Error",
    "details": [
      {
        "value": "",
        "msg": "Email is required",
        "param": "email",
        "location": "body"
      }
    ]
  }
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "error": {
    "message": "Invalid or expired token"
  }
}
```

### Forbidden (403)
```json
{
  "success": false,
  "error": {
    "message": "Insufficient permissions"
  }
}
```

### Not Found (404)
```json
{
  "success": false,
  "error": {
    "message": "Event not found"
  }
}
```

### Conflict (409)
```json
{
  "success": false,
  "error": {
    "message": "Email already registered"
  }
}
```

### Server Error (500)
```json
{
  "success": false,
  "error": {
    "message": "Internal Server Error"
  }
}
```

## Headers HTTP Recomendados

### Requests
```
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}
User-Agent: QueSaleClient/1.0
```

### Responses
```
Access-Control-Allow-Origin: *
Content-Type: application/json; charset=utf-8
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1234567890
Cache-Control: no-cache, no-store, must-revalidate
```

## Mensajes de Error Comunes

### Autenticación
- "Access token required"
- "Invalid or expired token"
- "Authentication required"

### Validación
- "Email already registered"
- "Username already taken"
- "Passwords do not match"
- "{field} is required"

### Autorización
- "Insufficient permissions"
- "Unauthorized to update this resource"

### Recursos
- "User not found"
- "Event not found"
- "Ticket not found"

### Negocio
- "User already has a ticket for this event"
- "Ticket already validated"
- "Event capacity reached"

---

Ver README.md para más ejemplos de requests/responses.
