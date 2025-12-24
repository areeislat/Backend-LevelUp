# E-Commerce Backend API

Backend completo y escalable para e-commerce construido con Node.js, Express, MongoDB Atlas y Cloudinary.

## 🌐 URL de Producción

**Servicio activo en Google Cloud Run**: https://ecommerce-backend-749990022458.us-central1.run.app

**Documentación Swagger en producción**: https://ecommerce-backend-749990022458.us-central1.run.app/api-docs

## 🚀 Características

- **Autenticación JWT**: Sistema seguro con email y contraseña hasheada
- **Control de acceso**: Roles de usuario (admin, user)
- **Gestión de productos**: CRUD completo con imágenes en Cloudinary
- **Gestión de categorías**: Organización por categorías
- **Control de stock**: Reserva, liberación y ajuste de inventario
- **Carrito persistente**: Gestión de carrito por usuario en base de datos
- **Gestión de órdenes**: Sistema completo de pedidos con tracking
- **Sistema de lealtad**: Puntos y recompensas
- **Arquitectura limpia**: Separación en capas (modelos, controladores, rutas, middlewares)
- **Manejo de errores centralizado**: Respuestas consistentes y claras
- **Documentación Swagger**: API docs en `/api-docs`
- **Seguridad**: CORS multi-origen, Helmet, Rate Limiting, bcrypt
- **Despliegue**: Google Cloud Run con CI/CD automático

## 📖 Documentación Adicional

- **[PRUEBAS_API.md](./PRUEBAS_API.md)** - Guía completa de pruebas de API con ejemplos
- **[QUICKSTART.md](./QUICKSTART.md)** - Guía de inicio rápido
- **[TESTING.md](./TESTING.md)** - Guía de pruebas funcionales
- **[API_EXAMPLES.md](./API-EXAMPLES.md)** - Ejemplos de uso de la API
- **[DEPLOYMENT-GCP.md](./DEPLOYMENT-GCP.md)** - Guía de despliegue en Google Cloud Platform
- **[Swagger Docs](http://localhost:8080/api-docs)** - Documentación interactiva (cuando el servidor esté corriendo)

## 📋 Requisitos Previos

- Node.js >= 18.x
- MongoDB Atlas (cuenta gratuita)
- Cloudinary (cuenta gratuita)
- npm o yarn

## 🔧 Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd eCommerceBackend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz del proyecto:

```env
# Server Configuration
PORT=8080
NODE_ENV=development

# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ecommerce?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS Configuration (múltiples orígenes separados por coma)
CORS_ORIGIN=http://localhost:5173,https://level-up-gamer-i5lm.vercel.app
```

4. **Insertar datos iniciales** (Opcional)

```bash
# Insertar categorías
node insert-categories.js

# Insertar productos
node insert-products.js
```

5. **Iniciar el servidor**
```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en `http://localhost:8080`

## 📁 Estructura del Proyecto

```
eCommerceBackend/
├── src/
│   ├── config/           # Configuración de la aplicación
│   │   ├── database.js   # Conexión a MongoDB Atlas
│   │   ├── env.js        # Variables de entorno
│   │   ├── swagger.js    # Configuración de Swagger
│   │   └── cloudinary.js # Configuración de Cloudinary
│   │
│   ├── models/           # Modelos de Mongoose
│   │   ├── index.js      # Exportación de modelos
│   │   ├── auth/         # Modelos de autenticación
│   │   │   ├── User.js
│   │   │   └── Session.js
│   │   ├── catalog/      # Modelos de catálogo
│   │   │   ├── Category.js
│   │   │   ├── Product.js
│   │   │   └── Review.js
│   │   ├── orders/       # Modelos de órdenes
│   │   │   ├── Cart.js
│   │   │   ├── Order.js
│   │   │   └── Payment.js
│   │   ├── loyalty/      # Sistema de lealtad
│   │   │   ├── LoyaltyAccount.js
│   │   │   ├── PointsTransaction.js
│   │   │   ├── Reward.js
│   │   │   └── RedeemedReward.js
│   │   └── support/      # Soporte
│   │       ├── Ticket.js
│   │       └── Notification.js
│   │
│   ├── controllers/      # Controladores (lógica de negocio)
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   └── ...
│   │
│   ├── routes/           # Definición de rutas
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── productRoutes.js
│   │   ├── categoryRoutes.js
│   │   └── ...
│   │
│   ├── middlewares/      # Middlewares personalizados
│   │   ├── authMiddleware.js    # Autenticación JWT
│   │   ├── errorHandler.js      # Manejo de errores
│   │   └── uploadImage.js       # Upload a Cloudinary
│   │
│   ├── utils/            # Utilidades
│   │   ├── jwt.js        # Funciones para JWT
│   │   ├── validators.js # Validadores
│   │   └── errors.js     # Errores personalizados
│   │
│   └── server.js         # Punto de entrada
│
├── insert-categories.js  # Script para insertar categorías
├── insert-products.js    # Script para insertar productos
├── .gitignore
├── package.json
├── PRUEBAS_API.md       # Guía de pruebas
└── README.md
```

## 🔐 Autenticación

El sistema utiliza JWT (JSON Web Tokens) para la autenticación. Todas las rutas protegidas requieren:

**Header de Autenticación**:
```
Authorization: Bearer <token>
```

### Flujo de Autenticación

1. Registrar un usuario: `POST /api/auth/register`
2. Hacer login para obtener el token JWT: `POST /api/auth/login`
3. Usar el token en las peticiones subsecuentes

### Endpoints de Autenticación

- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener perfil actual
- `PUT /api/auth/profile` - Actualizar perfil
- `POST /api/auth/logout` - Cerrar sesión

## 📚 API Endpoints

### Health Check
```
GET /health - Verificar estado del servidor
```

### Documentación Swagger
```
GET /api-docs - Documentación interactiva de la API
```

### Autenticación
```
POST   /api/auth/register    - Registrar nuevo usuario
POST   /api/auth/login       - Iniciar sesión
GET    /api/auth/me          - Obtener perfil actual
PUT    /api/auth/profile     - Actualizar perfil
POST   /api/auth/logout      - Cerrar sesión
```

### Usuarios (Admin only)
```
GET    /api/users            - Obtener todos los usuarios
GET    /api/users/:id        - Obtener un usuario por ID
POST   /api/users            - Crear usuario
PUT    /api/users/:id        - Actualizar usuario
DELETE /api/users/:id        - Eliminar usuario
```

### Categorías
```
GET    /api/categories       - Obtener todas las categorías
GET    /api/categories/:id   - Obtener categoría por ID
POST   /api/categories       - Crear categoría (admin)
PUT    /api/categories/:id   - Actualizar categoría (admin)
DELETE /api/categories/:id   - Eliminar categoría (admin)
```

### Productos
```
GET    /api/products                    - Obtener todos los productos
GET    /api/products/:idOrSlug          - Obtener producto por ID/slug/productId
POST   /api/products                    - Crear producto (admin)
PUT    /api/products/:id                - Actualizar producto (admin)
DELETE /api/products/:id                - Eliminar producto (admin)
PATCH  /api/products/:id/stock          - Actualizar stock (admin)
POST   /api/products/:id/reserve        - Reservar stock (admin)
POST   /api/products/:id/release        - Liberar stock (admin)
POST   /api/products/upload-image       - Subir imagen a Cloudinary (admin)
POST   /api/products/upload-image-test  - Subir imagen sin autenticación (temporal - testing)
```

### Carrito
```
GET    /api/cart                        - Obtener carrito del usuario
POST   /api/cart/items                  - Añadir producto al carrito
PUT    /api/cart/items/:productId       - Actualizar cantidad
DELETE /api/cart/items/:productId       - Eliminar producto del carrito
DELETE /api/cart                        - Vaciar carrito
POST   /api/cart/coupon                 - Aplicar cupón de descuento
DELETE /api/cart/coupon                 - Remover cupón de descuento
POST   /api/cart/merge                  - Fusionar carrito de invitado con usuario
```

### Órdenes
```
POST   /api/orders                      - Crear orden desde carrito
GET    /api/orders/my-orders            - Obtener mis órdenes
GET    /api/orders                      - Obtener todas las órdenes (admin)
GET    /api/orders/admin/all            - Obtener todas las órdenes del sistema con filtros (admin)
GET    /api/orders/:id                  - Obtener orden por ID
PUT    /api/orders/:id/status           - Actualizar estado (admin)
POST   /api/orders/:id/cancel           - Cancelar orden
```

### Loyalty (Sistema de Lealtad)
```
GET    /api/loyalty/account                - Obtener cuenta de puntos
GET    /api/loyalty/transactions           - Historial de transacciones de puntos
POST   /api/loyalty/add-points             - Agregar puntos manualmente (Admin)
POST   /api/loyalty/process-order-points   - Procesar puntos por compra (Admin)
GET    /api/loyalty/rewards                - Obtener recompensas disponibles
GET    /api/loyalty/rewards/:id            - Obtener recompensa por ID
POST   /api/loyalty/rewards                - Crear recompensa (Admin)
PUT    /api/loyalty/rewards/:id            - Actualizar recompensa (Admin)
DELETE /api/loyalty/rewards/:id            - Eliminar recompensa (Admin)
POST   /api/loyalty/redeem                 - Canjear recompensa
GET    /api/loyalty/my-rewards             - Obtener mis recompensas canjeadas
POST   /api/loyalty/my-rewards/:id/use     - Usar recompensa canjeada
POST   /api/loyalty/validate-coupon        - Validar cupón de recompensa
```

## 🧪 Ejemplos de Uso

Ver [PRUEBAS_API.md](./PRUEBAS_API.md) para ejemplos completos y guía de pruebas paso a paso.

### Registro y Login

```bash
# Registrar usuario
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "name": "Admin Principal",
  "email": "admin@tutienda.com",
  "password": "Admin123!",
  "role": "admin"
}

# Login
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "admin@tutienda.com",
  "password": "Admin123!"
}
```

### Crear Producto

```bash
POST http://localhost:8080/api/products
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "productId": "SKU-001",
  "name": "Producto Demo",
  "description": "Descripción del producto",
  "brand": "Mi Marca",
  "price": 19990,
  "oldPrice": 24990,
  "image": "/productos/demo.jpg",
  "images": ["/productos/demo.jpg"],
  "category": "juegos",
  "stock": {
    "current": 50,
    "minLevel": 5,
    "maxLevel": 100
  }
}
```

### Subir Imagen a Cloudinary

```bash
POST http://localhost:8080/api/products/upload-image
Authorization: Bearer <TOKEN>
Content-Type: multipart/form-data

# Envía un FormData con la imagen en el campo "image"
```

### Obtener Todas las Órdenes (Admin)

```bash
# Obtener todas las órdenes con filtros opcionales
GET http://localhost:8080/api/orders/admin/all?status=pending&page=1&limit=50
Authorization: Bearer <TOKEN_ADMIN>

# Parámetros de query opcionales:
# - status: pending, processing, shipped, delivered, cancelled
# - userId: ID del usuario para filtrar sus órdenes
# - search: Búsqueda por número de orden, email o nombre
# - page: Número de página (default: 1)
# - limit: Órdenes por página (default: 50, max: 100)
```

### Insertar Datos Masivos

```bash
# Insertar categorías
node insert-categories.js

# Insertar productos
node insert-products.js
```

## 🔒 Seguridad

- **Contraseñas hasheadas**: Usando bcryptjs con salt de 10 rondas
- **JWT**: Tokens con expiración de 7 días
- **CORS**: Configurado para múltiples orígenes (localhost:5173, Vercel) con credenciales
- **Helmet**: Protección de headers HTTP
- **Rate Limiting**: Prevención de ataques de fuerza bruta
- **Trust Proxy**: Habilitado para Google Cloud Run
- **Validación de entrada**: Con validadores personalizados
- **Autorización basada en roles**: Admin y User con permisos diferenciados
- **Cloudinary**: Almacenamiento seguro de imágenes con API Key/Secret

## 🎯 Roles de Usuario

### Admin
- Gestionar usuarios
- CRUD completo de productos, categorías y recompensas
- Ver todas las órdenes
- Actualizar estado de órdenes
- Subir imágenes a Cloudinary
- Gestionar stock y reservas

### User (Customer)
- Ver productos y categorías
- Gestionar carrito
- Crear y cancelar órdenes
- Ver sus propias órdenes
- Actualizar perfil y direcciones
- Sistema de loyalty (ganar y canjear puntos)

## 📊 Modelos de Datos

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hasheado),
  role: Enum ['admin', 'user'],
  addresses: [{
    alias: String,
    direccion: String,
    comuna: String,
    region: String,
    codigoPostal: String,
    isDefault: Boolean
  }],
  preferences: {
    notifications: Boolean,
    newsletter: Boolean
  },
  settings: {
    currency: String,
    timezone: String,
    language: String
  }
}
```

### User
```javascript
{
  tenantId: ObjectId,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Product
```javascript
{
  productId: String (SKU único),
  name: String,
  slug: String (auto-generado),
  description: String,
  brand: String,
  price: Number,
  oldPrice: Number,
  image: String (URL),
  images: [String],
  category: String,
  isNew: Boolean,
  isPromo: Boolean,
  isActive: Boolean,
  stock: {
    current: Number,
    reserved: Number,
    minLevel: Number,
    maxLevel: Number,
    lastUpdated: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Category
```javascript
{
  name: String (unique),
  slug: String (auto-generado),
  description: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Cart
```javascript
{
  user: ObjectId (ref: User),
  items: [{
    product: ObjectId (ref: Product),
    quantity: Number,
    price: Number
  }],
  status: Enum ['active', 'completed', 'abandoned'],
  createdAt: Date,
  updatedAt: Date
}
```

### Order
```javascript
{
  user: ObjectId (ref: User),
  orderNumber: String (auto-generado),
  items: [{
    product: ObjectId (ref: Product),
    quantity: Number,
    price: Number
  }],
  subtotal: Number,
  shipping: Number,
  discount: Number,
  total: Number,
  status: Enum ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
  paymentStatus: Enum ['pending', 'paid', 'failed', 'refunded'],
  paymentMethod: String,
  shippingAddress: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### LoyaltyAccount
```javascript
{
  user: ObjectId (ref: User),
  balance: Number,
  totalEarned: Number,
  totalRedeemed: Number,
  tier: Enum ['bronze', 'silver', 'gold', 'platinum'],
  createdAt: Date,
  updatedAt: Date
}
```

### Reward
```javascript
{
  name: String,
  description: String,
  pointsCost: Number,
  value: Number,
  category: Enum ['discount', 'gift', 'shipping'],
  isActive: Boolean,
  stock: Number,
  expiryDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🧰 Tecnologías Utilizadas

- **Node.js v24.11.1**: Entorno de ejecución
- **Express 4.x**: Framework web minimalista
- **MongoDB Atlas**: Base de datos NoSQL en la nube
- **Mongoose 8.x**: ODM para MongoDB con validación y middleware
- **JWT (jsonwebtoken)**: Autenticación basada en tokens
- **Bcryptjs**: Hashing de contraseñas con salt
- **Cloudinary**: Servicio de almacenamiento y CDN de imágenes
- **Helmet**: Seguridad de headers HTTP
- **CORS**: Control de acceso entre orígenes
- **Express Rate Limit**: Limitación de peticiones
- **Slugify**: Generación de slugs URL-friendly
- **Swagger UI Express**: Documentación interactiva de API

## 🚦 Manejo de Errores

El sistema incluye manejo centralizado de errores con respuestas consistentes:

```javascript
{
  success: false,
  message: "Descripción del error",
  error: {} // Detalles adicionales (opcional)
}
```

Códigos de estado HTTP:
- `200`: Éxito en operación
- `201`: Recurso creado exitosamente
- `400`: Error de validación o petición incorrecta
- `401`: No autorizado (sin token o token inválido)
- `403`: Prohibido (sin permisos suficientes)
- `404`: Recurso no encontrado
- `409`: Conflicto (ej: email duplicado)
- `500`: Error interno del servidor

## 📝 Mejores Prácticas Implementadas

- ✅ Separación de responsabilidades (MVC)
- ✅ Código modular y reutilizable
- ✅ Validación de entrada con validadores personalizados
- ✅ Manejo de errores robusto con middleware centralizado
- ✅ Índices únicos en MongoDB para emails y slugs
- ✅ Soft delete (isActive: false en lugar de eliminación física)
- ✅ Generación automática de slugs SEO-friendly
- ✅ JWT con expiración de 7 días
- ✅ Sistema de stock con reservas y niveles mínimos/máximos
- ✅ Documentación Swagger completa
- ✅ Scripts de inserción masiva de datos
- ✅ Integración con Cloudinary para imágenes

## 🔄 Próximas Mejoras

- [ ] Tests unitarios e integración con Jest
- [ ] Logging avanzado con Winston o Pino
- [ ] Cache con Redis para consultas frecuentes
- [ ] Procesamiento de pagos con Stripe/MercadoPago
- [ ] Webhooks para notificaciones de órdenes
- [ ] Sistema de envío de emails con Nodemailer
- [ ] Panel de métricas y analytics
- [ ] Sistema de reviews y ratings para productos
- [ ] Búsqueda avanzada con filtros múltiples
- [ ] Internacionalización (i18n)

## 📄 Licencia

MIT

## 👨‍💻 Autor

Backend API desarrollada siguiendo las mejores prácticas de Node.js y arquitectura limpia para eCommerce.

## 🆘 Solución de Problemas

### Error: Invalid Signature (Cloudinary)
- Verifica que `CLOUDINARY_API_SECRET` en `.env` sea exacto desde el dashboard
- No debe tener espacios ni caracteres extra
- Reinicia el servidor después de cambiar `.env`

### Productos retornan vacío
- Verifica que las categorías existan primero
- Ejecuta `node insert-categories.js` antes de `insert-products.js`
- Verifica conexión a MongoDB Atlas

### Error de autenticación
- Asegúrate de incluir header: `Authorization: Bearer <TOKEN>`
- Verifica que el token no haya expirado (7 días)
- Para admin, asegúrate de que `role: "admin"` en el usuario

