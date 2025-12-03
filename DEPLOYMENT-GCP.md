# 🚀 Guía de Despliegue en Google Cloud Platform

Esta guía te ayudará a desplegar tu backend de e-commerce en Google Cloud Platform (GCP).

## 📋 Tabla de Contenidos

1. [Prerequisitos](#prerequisitos)
2. [Opciones de Despliegue](#opciones-de-despliegue)
3. [Configuración Inicial](#configuración-inicial)
4. [Despliegue con Cloud Run (Recomendado)](#despliegue-con-cloud-run)
5. [Despliegue con App Engine](#despliegue-con-app-engine)
6. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
7. [Configuración de MongoDB](#configuración-de-mongodb)
8. [Monitoreo y Logs](#monitoreo-y-logs)
9. [Solución de Problemas](#solución-de-problemas)

---

## 🔧 Prerequisitos

Antes de comenzar, asegúrate de tener:

1. **Cuenta de Google Cloud Platform**
   - Crea una cuenta en [https://cloud.google.com](https://cloud.google.com)
   - Configura un proyecto en GCP Console
   - Habilita la facturación (incluye $300 de crédito gratuito)

2. **Google Cloud SDK instalado**
   ```bash
   # Descarga desde: https://cloud.google.com/sdk/docs/install
   
   # Verificar instalación
   gcloud --version
   ```

3. **Docker instalado** (solo para Cloud Run)
   ```bash
   # Descarga desde: https://www.docker.com/products/docker-desktop
   
   # Verificar instalación
   docker --version
   ```

4. **Autenticación en GCP**
   ```bash
   # Iniciar sesión
   gcloud auth login
   
   # Configurar proyecto
   gcloud config set project YOUR_PROJECT_ID
   ```

---

## 🎯 Opciones de Despliegue

### **Cloud Run** ⭐ (Recomendado)

✅ **Ventajas:**
- Serverless (paga solo por uso)
- Auto-escalado automático
- Soporte completo para contenedores
- Más flexible y moderno
- Ideal para APIs REST
- Menor costo para tráfico bajo/medio

❌ **Desventajas:**
- Requiere conocimientos básicos de Docker
- Cold start en instancias inactivas (mitigable)

### **App Engine**

✅ **Ventajas:**
- Más simple de configurar
- No requiere Docker
- Manejo automático de certificados SSL

❌ **Desventajas:**
- Menos flexible
- Puede ser más costoso
- Menos control sobre el entorno

---

## 🚀 Configuración Inicial

### 1. Obtener tu Project ID

```bash
# Listar proyectos
gcloud projects list

# O crear uno nuevo
gcloud projects create YOUR_PROJECT_ID --name="E-Commerce Backend"
```

### 2. Editar el script de despliegue

Abre `deploy-gcp.ps1` (Windows) o `deploy-gcp.sh` (Mac/Linux) y actualiza:

```powershell
$PROJECT_ID = "tu-project-id-real"  # Reemplazar
$REGION = "us-central1"              # Ajustar según tu región
$SERVICE_NAME = "ecommerce-backend"  # Opcional: cambiar nombre
```

### 3. Habilitar APIs necesarias

```bash
# Cloud Run
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# App Engine
gcloud services enable appengine.googleapis.com
```

---

## ☁️ Despliegue con Cloud Run

### Método 1: Script Automático (Recomendado)

```powershell
# En PowerShell (Windows)
.\deploy-gcp.ps1
# Selecciona opción 1

# En Bash (Mac/Linux)
chmod +x deploy-gcp.sh
./deploy-gcp.sh
# Selecciona opción 1
```

### Método 2: Manual

```bash
# 1. Configurar proyecto
gcloud config set project YOUR_PROJECT_ID

# 2. Construir la imagen
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/ecommerce-backend

# 3. Desplegar a Cloud Run
gcloud run deploy ecommerce-backend \
  --image gcr.io/YOUR_PROJECT_ID/ecommerce-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars NODE_ENV=production
```

### Configuración Avanzada

```bash
# Con más variables de entorno
gcloud run deploy ecommerce-backend \
  --image gcr.io/YOUR_PROJECT_ID/ecommerce-backend \
  --platform managed \
  --region us-central1 \
  --set-env-vars NODE_ENV=production,PORT=8080 \
  --set-secrets MONGODB_URI=mongodb-uri:latest,JWT_SECRET=jwt-secret:latest \
  --memory 1Gi \
  --cpu 2 \
  --timeout 300 \
  --concurrency 80
```

---

## 🌐 Despliegue con App Engine

### Método 1: Script Automático

```powershell
# En PowerShell (Windows)
.\deploy-gcp.ps1
# Selecciona opción 2

# En Bash (Mac/Linux)
./deploy-gcp.sh
# Selecciona opción 2
```

### Método 2: Manual

```bash
# 1. Crear App Engine (solo primera vez)
gcloud app create --region=us-central

# 2. Desplegar
gcloud app deploy app.yaml

# 3. Ver la app
gcloud app browse
```

---

## 🔐 Configuración de Variables de Entorno

### Opción 1: Google Cloud Secret Manager (Recomendado)

```bash
# 1. Habilitar Secret Manager API
gcloud services enable secretmanager.googleapis.com

# 2. Crear secrets
echo -n "tu-mongodb-uri" | gcloud secrets create mongodb-uri --data-file=-
echo -n "tu-jwt-secret" | gcloud secrets create jwt-secret --data-file=-
echo -n "tu-cloudinary-key" | gcloud secrets create cloudinary-api-key --data-file=-

# 3. Dar permisos al servicio
gcloud secrets add-iam-policy-binding mongodb-uri \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# 4. Usar en Cloud Run
gcloud run services update ecommerce-backend \
  --update-secrets=MONGODB_URI=mongodb-uri:latest,JWT_SECRET=jwt-secret:latest
```

### Opción 2: Variables de Entorno en Cloud Run Console

1. Ve a [Cloud Run Console](https://console.cloud.google.com/run)
2. Selecciona tu servicio
3. Click en "EDIT & DEPLOY NEW REVISION"
4. En "Variables & Secrets" agrega:
   - `NODE_ENV=production`
   - `PORT=8080`
   - `MONGODB_URI=mongodb+srv://...`
   - `JWT_SECRET=tu-secret`
   - Todas las demás variables de tu `.env`

### Opción 3: Variables en app.yaml (App Engine)

Edita `app.yaml`:

```yaml
env_variables:
  NODE_ENV: "production"
  PORT: "8080"
  MONGODB_URI: "mongodb+srv://user:pass@cluster.mongodb.net/dbname"
  JWT_SECRET: "tu-jwt-secret"
  CORS_ORIGIN: "https://tu-frontend.com"
  # ... otras variables
```

⚠️ **Nota:** No subas `app.yaml` con secretos a Git. Usa Secret Manager.

---

## 🗄️ Configuración de MongoDB

### Opción 1: MongoDB Atlas (Recomendado)

1. **Crear cluster en Atlas**
   - Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Crea un cluster gratuito (M0)

2. **Configurar Network Access**
   - En Atlas, ve a "Network Access"
   - Click "Add IP Address"
   - Selecciona "Allow Access from Anywhere" (0.0.0.0/0)
   - O agrega las IPs de salida de Cloud Run

3. **Obtener Connection String**
   - En Atlas, click "Connect" en tu cluster
   - Selecciona "Connect your application"
   - Copia el connection string
   - Reemplaza `<password>` con tu password real

4. **Configurar en GCP**
   ```bash
   echo -n "mongodb+srv://user:pass@cluster.mongodb.net/ecommerce" | \
     gcloud secrets create mongodb-uri --data-file=-
   ```

### Opción 2: MongoDB en GCE (Más complejo)

Si necesitas MongoDB self-hosted en GCP:

1. Crea una VM en Compute Engine
2. Instala MongoDB
3. Configura VPC Connector para conectar Cloud Run con la VM privada

---

## 📊 Monitoreo y Logs

### Ver Logs en Cloud Run

```bash
# Ver logs en tiempo real
gcloud run services logs tail ecommerce-backend --region us-central1

# Ver logs recientes
gcloud run services logs read ecommerce-backend --limit 100
```

### Ver Logs en App Engine

```bash
# Ver logs en tiempo real
gcloud app logs tail

# Ver logs con filtro
gcloud app logs read --service=default --limit=100
```

### Cloud Console

1. Ve a [Logging](https://console.cloud.google.com/logs)
2. Filtra por servicio
3. Usa queries para buscar errores:
   ```
   resource.type="cloud_run_revision"
   severity>=ERROR
   ```

### Métricas y Alertas

1. Ve a [Monitoring](https://console.cloud.google.com/monitoring)
2. Crea dashboards personalizados
3. Configura alertas para:
   - Errores HTTP 5xx
   - Alta latencia
   - Uso de memoria
   - Cold starts

---

## 🔍 Verificar el Despliegue

### 1. Health Check

```bash
# Cloud Run
curl https://YOUR_SERVICE_URL/health

# Debería retornar:
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-12-02T..."
}
```

### 2. Swagger Documentation

Visita: `https://YOUR_SERVICE_URL/api-docs`

### 3. Test API Endpoint

```bash
# Test de registro
curl -X POST https://YOUR_SERVICE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "firstName": "Test",
    "lastName": "User"
  }'
```

---

## 🛠️ Solución de Problemas

### Error: "Container failed to start"

**Causa:** El puerto no está configurado correctamente.

**Solución:**
```bash
# Asegúrate de que el contenedor escuche en el puerto 8080
# Verifica src/config/env.js
```

### Error: "Cannot connect to MongoDB"

**Causa:** Connection string incorrecto o MongoDB no accesible.

**Solución:**
1. Verifica que la variable `MONGODB_URI` esté configurada
2. Verifica que las IPs de Cloud Run estén permitidas en MongoDB Atlas
3. Prueba la conexión localmente primero

### Error: "Memory limit exceeded"

**Solución:**
```bash
# Aumentar memoria en Cloud Run
gcloud run services update ecommerce-backend \
  --memory 1Gi \
  --region us-central1
```

### Cold Start lento

**Solución:**
```bash
# Mantener al menos 1 instancia siempre activa
gcloud run services update ecommerce-backend \
  --min-instances 1 \
  --region us-central1
```

### Ver errores detallados

```bash
# Cloud Run
gcloud run services logs tail ecommerce-backend \
  --region us-central1 \
  --filter="severity>=ERROR"

# App Engine
gcloud app logs read --severity=ERROR
```

---

## 📝 Comandos Útiles

```bash
# Ver servicios desplegados
gcloud run services list

# Describir un servicio
gcloud run services describe ecommerce-backend --region us-central1

# Actualizar configuración
gcloud run services update ecommerce-backend \
  --set-env-vars NEW_VAR=value

# Eliminar servicio
gcloud run services delete ecommerce-backend --region us-central1

# Ver versiones
gcloud run revisions list --service ecommerce-backend

# Rollback a versión anterior
gcloud run services update-traffic ecommerce-backend \
  --to-revisions REVISION_NAME=100
```

---

## 🌍 Configurar Dominio Personalizado

### Cloud Run

```bash
# 1. Mapear dominio
gcloud run domain-mappings create \
  --service ecommerce-backend \
  --domain api.tudominio.com \
  --region us-central1

# 2. Agregar registros DNS según las instrucciones
```

### App Engine

```bash
# Mapear dominio
gcloud app domain-mappings create api.tudominio.com
```

---

## 💰 Estimación de Costos

### Cloud Run (Tráfico Medio)

- **CPU:** $0.00002400/vCPU-second
- **Memoria:** $0.00000250/GiB-second
- **Requests:** $0.40/million requests

**Ejemplo:** ~10,000 requests/día con 100ms promedio
- Costo mensual: ~$5-15 USD

### App Engine

- **Instance hours:** ~$0.05/hour
- **24/7 con 1 instancia F2:** ~$36/mes

### MongoDB Atlas

- **M0 (Free):** Gratis, 512MB storage
- **M10 (Shared):** ~$9/mes, 10GB storage

---

## 🎉 ¡Listo!

Tu backend está ahora desplegado en Google Cloud Platform. 

### Próximos Pasos:

1. ✅ Configura un dominio personalizado
2. ✅ Implementa CI/CD con Cloud Build o GitHub Actions
3. ✅ Configura backups de MongoDB
4. ✅ Implementa rate limiting más agresivo para producción
5. ✅ Configura monitoreo y alertas
6. ✅ Considera implementar CDN para assets estáticos

### Recursos Adicionales:

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [App Engine Documentation](https://cloud.google.com/appengine/docs)
- [MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [Secret Manager](https://cloud.google.com/secret-manager/docs)

---

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs: `gcloud run services logs tail`
2. Verifica la configuración de variables de entorno
3. Consulta la [documentación oficial de GCP](https://cloud.google.com/docs)
4. Revisa el [GitHub Issues del proyecto](#)

---

**¡Feliz despliegue! 🚀**
