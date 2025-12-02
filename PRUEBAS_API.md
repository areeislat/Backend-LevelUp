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

**¡Listo!** Ahora puedes probar toda la API siguiendo este flujo. 🚀
