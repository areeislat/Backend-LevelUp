const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

/**
 * Configuración de Swagger para documentación de API
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce API',
      version: '1.0.0',
      description: 'API REST para e-commerce con Node.js, Express y MongoDB',
      contact: {
        name: 'API Support',
        email: 'support@ecommerce.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://api.ecommerce.com',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido del login'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'Juan Pérez' },
            email: { type: 'string', example: 'juan@example.com' },
            role: { type: 'string', enum: ['admin', 'customer'], example: 'customer' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'iPhone 15 Pro' },
            description: { type: 'string', example: 'Smartphone de última generación' },
            price: { type: 'number', example: 1299.99 },
            stock: { type: 'number', example: 50 },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Cart: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                  quantity: { type: 'number', example: 2 }
                }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'string' },
                  quantity: { type: 'number' },
                  price: { type: 'number' }
                }
              }
            },
            total: { type: 'number', example: 2599.98 },
            status: { 
              type: 'string', 
              enum: ['pending', 'paid', 'shipped', 'cancelled'],
              example: 'pending' 
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Error description' },
            statusCode: { type: 'number', example: 400 },
            details: { type: 'array', items: { type: 'object' } }
          }
        }
      }
    },
    tags: [
      {
        name: 'Auth',
        description: 'Endpoints de autenticación (registro y login)'
      },
      {
        name: 'Users',
        description: 'Gestión de usuarios (solo Admin)'
      },
      {
        name: 'Categories',
        description: 'Gestión de categorías de productos'
      },
      {
        name: 'Products',
        description: 'Gestión de productos del catálogo'
      },
      {
        name: 'Reviews',
        description: 'Reseñas y calificaciones de productos'
      },
      {
        name: 'Cart',
        description: 'Carrito de compras persistente'
      },
      {
        name: 'Orders',
        description: 'Gestión de órdenes y pedidos'
      },
      {
        name: 'Payments',
        description: 'Procesamiento de pagos'
      },
      {
        name: 'Loyalty',
        description: 'Sistema de lealtad y recompensas'
      },
      {
        name: 'Notifications',
        description: 'Notificaciones de usuario'
      },
      {
        name: 'Tickets',
        description: 'Sistema de soporte y tickets'
      }
    ]
  },
  apis: ['./src/routes/*.js'] // Archivos a escanear para documentación
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = {
  swaggerUi,
  swaggerSpec
};

