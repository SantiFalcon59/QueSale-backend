# QueSale - Backend

API REST y WebSocket Server para la plataforma QueSale.

## Stack Tecnológico

- **Core**: Node.js & Express (ES Modules)
- **Base de Datos**: MySQL
- **ORM**: Prisma ORM (v5.22.0)
- **Autenticación**: Firebase Admin SDK
- **Comunicación en Tiempo Real**: Socket.io (WebSockets)

## Requisitos Previos

- Node.js (v18 o superior)
- MySQL Server

## Configuración y Ejecución

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar variables de entorno (`.env`):
   ```env
   DATABASE_URL="mysql://usuario:contraseña@localhost:3306/quesale"
   PORT=3016
   ```

3. Aplicar migraciones de Prisma:
   ```bash
   npx prisma db push
   ```

4. Iniciar en modo desarrollo:
   ```bash
   npm run dev
   ```
