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

**¡Listo!** Ahora puedes probar toda la API siguiendo este flujo. 🚀
