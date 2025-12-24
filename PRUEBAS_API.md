# Guía de Pruebas API - eCommerce Backend

## ✅ Flujo completo para probar la API como Admin

### 1️⃣ Registrar Usuario Admin

**Endpoint:** `POST http://localhost:3000/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Admin Principal",
  "email": "admin@tutienda.com",
  "password": "Admin123!",
  "role": "admin"
}
```

**Respuesta esperada:**
```json
{
  "message": "Usuario registrado exitosamente",
  "statusCode": 201,
  "data": {
    "user": {
      "id": "...",
      "name": "Admin Principal",
      "email": "admin@tutienda.com",
      "role": "admin",
      "isActive": true,
      "createdAt": "..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**⚠️ IMPORTANTE:** Guarda el `token` de la respuesta, lo necesitarás para todas las siguientes peticiones.

---

### 2️⃣ Crear una Categoría

**Endpoint:** `POST http://localhost:3000/api/categories`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TU_TOKEN_AQUI
```

**Body:**
```json
{
  "name": "Ropa",
  "slug": "ropa",
  "description": "Categoría de prendas de vestir y accesorios",
  "icon": "tshirt"
}
```

**Respuesta esperada:**
```json
{
  "message": "Categoría creada exitosamente",
  "statusCode": 201,
  "data": {
    "category": {
      "_id": "...",
      "name": "Ropa",
      "slug": "ropa",
      "description": "Categoría de prendas de vestir y accesorios",
      "icon": "tshirt"
    }
  }
}
```

---

### 3️⃣ Subir Imagen a Cloudinary (Opcional)

**Endpoint:** `POST http://localhost:3000/api/products/upload-image`

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

**Body:** (form-data)
```
image: [Selecciona un archivo de imagen]
```

**Respuesta esperada:**
```json
{
  "url": "https://res.cloudinary.com/tu_cloud/image/upload/v123456789/producto.jpg"
}
```

**⚠️ NOTA:** Guarda la URL de la imagen para usarla en el producto.

---

### 4️⃣ Crear un Producto

**Endpoint:** `POST http://localhost:3000/api/products`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TU_TOKEN_AQUI
```

**Body:**
```json
{
  "productId": "SKU-001",
  "name": "Camiseta Básica",
  "description": "Camiseta 100% algodón, cómoda y versátil",
  "brand": "Mi Marca",
  "price": 19990,
  "oldPrice": 24990,
  "image": "https://via.placeholder.com/400",
  "images": ["https://via.placeholder.com/400"],
  "category": "ropa",
  "stock": {
    "current": 50,
    "minLevel": 5,
    "maxLevel": 100
  }
}
```

**Respuesta esperada:**
```json
{
  "message": "Producto creado exitosamente",
  "statusCode": 201,
  "data": {
    "product": {
      "_id": "...",
      "productId": "SKU-001",
      "name": "Camiseta Básica",
      "price": 19990,
      "stock": {
        "current": 50,
        "minLevel": 5,
        "maxLevel": 100
      },
      ...
    }
  }
}
```

---

### 5️⃣ Obtener Todos los Productos

**Endpoint:** `GET http://localhost:3000/api/products`

**Headers:** (ninguno requerido)

**Respuesta esperada:**
```json
{
  "message": "Productos obtenidos exitosamente",
  "statusCode": 200,
  "data": {
    "products": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

---

## 🔍 Verificar Base de Datos en MongoDB Atlas

1. Ve a https://cloud.mongodb.com/
2. Inicia sesión con tu cuenta
3. Selecciona tu cluster `Cluster0`
4. Click en "Browse Collections"
5. Deberías ver la base de datos `ecommerce` con estas colecciones:
   - `users` (con tu admin)
   - `categories` (con tu categoría)
   - `products` (con tu producto)

---

## 🐛 Solución de Problemas

### "Token inválido: faltan datos del usuario"
- Asegúrate de que el token sea el correcto (copiado completo)
- Verifica que el header Authorization sea: `Bearer TOKEN` (con espacio después de Bearer)

### "No se crean las colecciones en MongoDB"
- Verifica que el servidor esté conectado: Deberías ver `✅ MongoDB conectado:` en la consola
- Asegúrate de que la URI en `src/config/env.js` tenga el nombre de la base de datos: `/ecommerce?`
- Reinicia el servidor después de hacer cambios en la configuración

### "Error al registrar usuario"
- Verifica que el email no esté ya registrado
- Asegúrate de enviar todos los campos requeridos: name, email, password

---

## 📝 Colecciones en Postman

Puedes importar estas peticiones en Postman:

1. Crea una nueva colección llamada "eCommerce API"
2. Agrega las peticiones anteriores
3. Crea una variable de entorno `{{token}}` y actualízala después del registro/login
4. Usa `{{token}}` en el header Authorization: `Bearer {{token}}`

---

## 🎯 Próximos Pasos

Una vez que tengas productos creados, puedes:
- Crear un carrito (POST /api/cart)
- Agregar productos al carrito (POST /api/cart/items)
- Crear una orden (POST /api/orders)
- Gestionar el stock (PATCH /api/products/:id/stock)

---

## 🧪 Pruebas CRUD Completas de Productos

### ✅ 1. CREATE - Crear Producto
**Ya probado arriba** ✓

---

### ✅ 2. READ - Obtener Todos los Productos

**Endpoint:** `GET http://localhost:3000/api/products`

**Headers:** Ninguno requerido

**Respuesta esperada:** Lista de todos los productos activos

---

### ✅ 3. READ - Obtener Un Producto

Puedes buscar por 3 formas diferentes:

**a) Por productId:**
```
GET http://localhost:3000/api/products/AUD-001
```

**b) Por slug:**
```
GET http://localhost:3000/api/products/audifinos-metal-ear
```

**c) Por _id de MongoDB:**
```
GET http://localhost:3000/api/products/692ee1ce1021c87a1eec94b9
```

**Headers:** Ninguno requerido

---

### ✅ 4. UPDATE - Actualizar Producto

**Endpoint:** `PUT http://localhost:3000/api/products/692ee1ce1021c87a1eec94b9`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TU_TOKEN_AQUI
```

**Body:** (Envía solo los campos que quieres actualizar)
```json
{
  "name": "Audífonos Metal EAR Premium",
  "price": 29990,
  "oldPrice": 39990,
  "description": "Audífonos de la mejor calidad del mundo con cancelación de ruido"
}
```

**Respuesta esperada:**
```json
{
  "message": "Producto actualizado exitosamente",
  "statusCode": 200,
  "data": {
    "product": {
      "_id": "692ee1ce1021c87a1eec94b9",
      "name": "Audífonos Metal EAR Premium",
      "price": 29990,
      ...
    }
  }
}
```

---

### ✅ 5. DELETE - Eliminar Producto (Soft Delete)

**Endpoint:** `DELETE http://localhost:3000/api/products/692ee1ce1021c87a1eec94b9`

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

**Respuesta esperada:**
```json
{
  "message": "Producto eliminado exitosamente",
  "statusCode": 200,
  "data": {
    "product": {
      "_id": "692ee1ce1021c87a1eec94b9",
      "isActive": false,
      ...
    }
  }
}
```

**⚠️ NOTA:** El producto se marca como `isActive: false` pero NO se borra de la base de datos (soft delete).

---

### ✅ 6. PATCH - Actualizar Solo el Stock

**Endpoint:** `PATCH http://localhost:3000/api/products/692ee1ce1021c87a1eec94b9/stock`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TU_TOKEN_AQUI
```

**Body:**
```json
{
  "quantity": 10,
  "type": "restock",
  "reason": "Nueva compra a proveedor"
}
```

**Tipos de actualización disponibles:**
- `restock` - Agregar stock (suma cantidad)
- `sale` - Venta (resta cantidad)
- `return` - Devolución (suma cantidad)
- `adjustment` - Ajuste manual

**Respuesta esperada:**
```json
{
  "message": "Stock actualizado exitosamente",
  "statusCode": 200,
  "data": {
    "product": {
      "stock": {
        "current": 60,
        ...
      }
    }
  }
}
```

---

### ✅ 7. POST - Reservar Stock (para órdenes)

**Endpoint:** `POST http://localhost:3000/api/products/692ee1ce1021c87a1eec94b9/reserve`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TU_TOKEN_AQUI
```

**Body:**
```json
{
  "quantity": 5,
  "orderId": "ORDER-123"
}
```

**Respuesta esperada:**
```json
{
  "message": "Stock reservado exitosamente",
  "statusCode": 200,
  "data": {
    "product": {
      "stock": {
        "current": 55,
        "reserved": 5,
        ...
      }
    }
  }
}
```

---

### ✅ 8. POST - Liberar Stock Reservado

**Endpoint:** `POST http://localhost:3000/api/products/692ee1ce1021c87a1eec94b9/release`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TU_TOKEN_AQUI
```

**Body:**
```json
{
  "quantity": 5,
  "orderId": "ORDER-123"
}
```

**Respuesta esperada:**
```json
{
  "message": "Stock liberado exitosamente",
  "statusCode": 200,
  "data": {
    "product": {
      "stock": {
        "current": 60,
        "reserved": 0,
        ...
      }
    }
  }
}
```

---

## 📋 Orden de Pruebas Recomendado

1. **CREATE** - Crear un producto nuevo
2. **READ ALL** - Verificar que aparece en la lista
3. **READ ONE** - Obtener el producto por productId/slug/_id
4. **UPDATE** - Actualizar nombre y precio
5. **PATCH STOCK** - Agregar más stock (restock)
6. **RESERVE** - Reservar algunas unidades
7. **RELEASE** - Liberar la reserva
8. **DELETE** - Marcar como inactivo
9. **READ ALL** - Verificar que ya no aparece en la lista (porque isActive=false)

---

## 🛒 Pruebas de Carrito (Cart)

### 1️⃣ Obtener Carrito

**Endpoint:** `GET http://localhost:3000/api/cart`

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

**Respuesta esperada:**
```json
{
  "message": "Carrito obtenido exitosamente",
  "statusCode": 200,
  "data": {
    "cart": {
      "_id": "...",
      "user": "...",
      "items": [],
      "subtotal": 0,
      "total": 0,
      "status": "active"
    }
  }
}
```

---

### 2️⃣ Agregar Producto al Carrito

**Endpoint:** `POST http://localhost:3000/api/cart/items`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TU_TOKEN_AQUI
```

**Body:**
```json
{
  "productId": "692ee1ce1021c87a1eec94b9",
  "quantity": 2
}
```

**Respuesta esperada:**
```json
{
  "message": "Producto agregado al carrito",
  "statusCode": 200,
  "data": {
    "cart": {
      "items": [
        {
          "product": {
            "_id": "692ee1ce1021c87a1eec94b9",
            "name": "Audífonos Metal EAR",
            "price": 19990,
            "image": "..."
          },
          "quantity": 2,
          "price": 19990
        }
      ],
      "subtotal": 39980,
      "total": 39980
    }
  }
}
```

---

### 3️⃣ Actualizar Cantidad de Producto

**Endpoint:** `PUT http://localhost:3000/api/cart/items/692ee1ce1021c87a1eec94b9`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TU_TOKEN_AQUI
```

**Body:**
```json
{
  "quantity": 3
}
```

---

### 4️⃣ Eliminar Producto del Carrito

**Endpoint:** `DELETE http://localhost:3000/api/cart/items/692ee1ce1021c87a1eec94b9`

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

---

### 5️⃣ Vaciar Carrito

**Endpoint:** `DELETE http://localhost:3000/api/cart`

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

---

## 📦 Pruebas de Órdenes (Orders)

### 1️⃣ Crear Orden desde Carrito

**Prerequisito:** Tener productos en el carrito

**Endpoint:** `POST http://localhost:3000/api/orders`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TU_TOKEN_AQUI
```

**Body:**
```json
{
  "shippingAddress": {
    "direccion": "Av. Providencia 123",
    "comuna": "Providencia",
    "region": "Metropolitana",
    "codigoPostal": "7500000"
  },
  "paymentMethod": "credit_card",
  "notes": "Dejar con conserje"
}
```

**Respuesta esperada:**
```json
{
  "message": "Orden creada exitosamente",
  "statusCode": 201,
  "data": {
    "order": {
      "_id": "...",
      "orderNumber": "ORD-1701542400000",
      "user": "...",
      "items": [...],
      "subtotal": 39980,
      "shipping": 5000,
      "total": 44980,
      "status": "pending",
      "paymentStatus": "pending",
      "shippingAddress": {...}
    }
  }
}
```

**⚠️ IMPORTANTE:** Guarda el `_id` de la orden para las siguientes pruebas.

---

### 2️⃣ Obtener Mis Órdenes

**Endpoint:** `GET http://localhost:3000/api/orders`

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

**Query Parameters (opcionales):**
- `status=pending` - Filtrar por estado
- `page=1` - Página actual
- `limit=10` - Límite por página

---

### 3️⃣ Obtener Orden por ID

**Endpoint:** `GET http://localhost:3000/api/orders/673d9a8e6d0e7a123456abcd`

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

---

### 4️⃣ Actualizar Estado de Orden (Admin)

**Endpoint:** `PUT http://localhost:3000/api/orders/673d9a8e6d0e7a123456abcd/status`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TOKEN_ADMIN
```

**Body:**
```json
{
  "status": "confirmed",
  "paymentStatus": "paid"
}
```

**Estados disponibles:**
- `status`: pending, confirmed, processing, shipped, delivered, cancelled
- `paymentStatus`: pending, paid, failed, refunded

---

### 5️⃣ Cancelar Orden

**Endpoint:** `POST http://localhost:3000/api/orders/673d9a8e6d0e7a123456abcd/cancel`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TU_TOKEN_AQUI
```

**Body:**
```json
{
  "reason": "Ya no necesito el producto"
}
```

---

## 💳 Pruebas de Pagos (Payments)

### 1️⃣ Crear Pago

**Endpoint:** `POST http://localhost:3000/api/payments`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TU_TOKEN_AQUI
```

**Body:**
```json
{
  "orderId": "673d9a8e6d0e7a123456abcd",
  "method": "credit_card",
  "gateway": "webpay"
}
```

**Métodos de pago disponibles:**
- `credit_card`
- `debit_card`
- `webpay`
- `mercadopago`
- `transferencia`

**Gateways disponibles:**
- `webpay`
- `mercadopago`
- `stripe`

**Respuesta esperada:**
```json
{
  "message": "Pago procesado exitosamente",
  "statusCode": 201,
  "data": {
    "payment": {
      "_id": "...",
      "order": "673d9a8e6d0e7a123456abcd",
      "amount": 44980,
      "method": "credit_card",
      "gateway": "webpay",
      "status": "completed",
      "transactionId": "TXN-1701542400000"
    }
  }
}
```

**⚠️ NOTA:** Este endpoint simula un pago exitoso inmediato. En producción, aquí se integraría con pasarelas reales.

---

### 2️⃣ Obtener Mis Pagos

**Endpoint:** `GET http://localhost:3000/api/payments`

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

**Query Parameters (opcionales):**
- `status=completed` - Filtrar por estado
- `page=1`
- `limit=10`

---

### 3️⃣ Obtener Pago por ID

**Endpoint:** `GET http://localhost:3000/api/payments/673d9a8e6d0e7a123456abcd`

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

---

## 🎁 Pruebas de Sistema de Lealtad (Loyalty)

### 1️⃣ Obtener Mi Cuenta de Puntos

**Endpoint:** `GET http://localhost:3000/api/loyalty/account`

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

**Respuesta esperada:**
```json
{
  "message": "Cuenta de lealtad obtenida",
  "statusCode": 200,
  "data": {
    "account": {
      "_id": "...",
      "user": "...",
      "balance": 1500,
      "totalEarned": 2000,
      "totalRedeemed": 500,
      "tier": "silver"
    }
  }
}
```

**Tiers disponibles:**
- `bronze` (0-999 puntos)
- `silver` (1000-4999 puntos)
- `gold` (5000-9999 puntos)
- `platinum` (10000+ puntos)

---

### 2️⃣ Ver Historial de Transacciones de Puntos

**Endpoint:** `GET http://localhost:3000/api/loyalty/transactions`

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

**Query Parameters (opcionales):**
- `type=earn` - Filtrar por tipo (earn, redeem, expire, adjustment)
- `page=1`
- `limit=20`

---

### 3️⃣ Obtener Recompensas Disponibles

**Endpoint:** `GET http://localhost:3000/api/loyalty/rewards`

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

**Respuesta esperada:**
```json
{
  "message": "Recompensas obtenidas",
  "statusCode": 200,
  "data": {
    "rewards": [
      {
        "_id": "...",
        "name": "Descuento 10%",
        "description": "10% de descuento en tu próxima compra",
        "pointsCost": 500,
        "value": 5000,
        "category": "discount",
        "isActive": true,
        "stock": 100
      }
    ]
  }
}
```

---

### 4️⃣ Canjear Recompensa

**Endpoint:** `POST http://localhost:3000/api/loyalty/redeem/673d9a8e6d0e7a123456abcd`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TU_TOKEN_AQUI
```

**Body:** (opcional)
```json
{}
```

**Respuesta esperada:**
```json
{
  "message": "Recompensa canjeada exitosamente",
  "statusCode": 201,
  "data": {
    "redeemedReward": {
      "_id": "...",
      "user": "...",
      "reward": {...},
      "pointsSpent": 500,
      "couponCode": "LOYALTY-ABC123",
      "status": "active",
      "expiresAt": "2025-01-02T00:00:00.000Z"
    }
  }
}
```

**⚠️ IMPORTANTE:** Guarda el `couponCode` para usar en tu próxima compra.

---

### 5️⃣ Ver Mis Recompensas Canjeadas

**Endpoint:** `GET http://localhost:3000/api/loyalty/my-redeemed`

**Headers:**
```
Authorization: Bearer TU_TOKEN_AQUI
```

**Query Parameters (opcionales):**
- `status=active` - Filtrar por estado (active, used, expired)

---

### 6️⃣ Crear Recompensa (Admin)

**Endpoint:** `POST http://localhost:3000/api/loyalty/rewards`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TOKEN_ADMIN
```

**Body:**
```json
{
  "name": "Envío Gratis",
  "description": "Envío gratis en tu próxima compra",
  "pointsCost": 1000,
  "value": 5000,
  "category": "shipping",
  "stock": 50,
  "expiryDate": "2025-12-31"
}
```

**Categorías disponibles:**
- `discount` - Descuentos en compras
- `gift` - Productos gratis
- `shipping` - Envíos gratis

---

### 7️⃣ Actualizar Recompensa (Admin)

**Endpoint:** `PUT http://localhost:3000/api/loyalty/rewards/673d9a8e6d0e7a123456abcd`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TOKEN_ADMIN
```

**Body:**
```json
{
  "pointsCost": 800,
  "stock": 75,
  "isActive": true
}
```

---

### 8️⃣ Eliminar Recompensa (Admin)

**Endpoint:** `DELETE http://localhost:3000/api/loyalty/rewards/673d9a8e6d0e7a123456abcd`

**Headers:**
```
Authorization: Bearer TOKEN_ADMIN
```

---

## 🔄 Flujo Completo de Compra

### Paso a Paso:

1. **Registrar usuario** (POST /api/auth/register)
2. **Ver productos** (GET /api/products)
3. **Agregar al carrito** (POST /api/cart/items) × múltiples productos
4. **Ver carrito** (GET /api/cart)
5. **Crear orden** (POST /api/orders)
6. **Crear pago** (POST /api/payments)
7. **Actualizar estado orden** (PUT /api/orders/:id/status) - Admin marca como "confirmed"
8. **Ganar puntos** automáticamente al confirmar orden
9. **Ver cuenta loyalty** (GET /api/loyalty/account)
10. **Canjear recompensa** (POST /api/loyalty/redeem/:rewardId)
11. **Usar cupón en próxima compra**

---

## 📊 Endpoints Adicionales

### Estadísticas de Órdenes (Admin)

**Endpoint:** `GET http://localhost:3000/api/orders/stats`

**Headers:**
```
Authorization: Bearer TOKEN_ADMIN
```

**Respuesta:**
```json
{
  "totalOrders": 156,
  "totalRevenue": 12500000,
  "averageOrderValue": 80128,
  "ordersByStatus": {
    "pending": 12,
    "confirmed": 45,
    "shipped": 67,
    "delivered": 30,
    "cancelled": 2
  }
}
```

---

### Validar Cupón de Loyalty

**Endpoint:** `POST http://localhost:3000/api/loyalty/validate-coupon`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TU_TOKEN_AQUI
```

**Body:**
```json
{
  "couponCode": "LOYALTY-ABC123"
}
```

---

### Aplicar Cupón al Carrito

**Endpoint:** `POST http://localhost:3000/api/cart/apply-coupon`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer TU_TOKEN_AQUI
```

**Body:**
```json
{
  "couponCode": "LOYALTY-ABC123"
}
```

---

**¡Listo!** Ahora puedes probar toda la API siguiendo este flujo. 🚀

