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
        url: 'http://localhost:8080',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://ecommerce-backend-749990022458.us-central1.run.app',
        description: 'Servidor de producción (Google Cloud Run)'
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
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            user: { type: 'string', example: '507f1f77bcf86cd799439011' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: { 
                    type: 'object',
                    properties: {
                      _id: { type: 'string' },
                      name: { type: 'string' },
                      price: { type: 'number' },
                      image: { type: 'string' }
                    }
                  },
                  quantity: { type: 'number', example: 2 },
                  price: { type: 'number', example: 19990 }
                }
              }
            },
            subtotal: { type: 'number', example: 39980 },
            discount: { type: 'number', example: 0 },
            total: { type: 'number', example: 39980 },
            status: { 
              type: 'string', 
              enum: ['active', 'completed', 'abandoned'],
              example: 'active'
            },
            couponCode: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            user: { type: 'string', example: '507f1f77bcf86cd799439011' },
            orderNumber: { type: 'string', example: 'ORD-1701542400000' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: { type: 'string', example: '507f1f77bcf86cd799439011' },
                  name: { type: 'string', example: 'Producto Demo' },
                  quantity: { type: 'number', example: 2 },
                  price: { type: 'number', example: 19990 },
                  subtotal: { type: 'number', example: 39980 }
                }
              }
            },
            subtotal: { type: 'number', example: 39980 },
            shipping: { type: 'number', example: 5000 },
            discount: { type: 'number', example: 0 },
            total: { type: 'number', example: 44980 },
            status: { 
              type: 'string', 
              enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
              example: 'pending' 
            },
            paymentStatus: {
              type: 'string',
              enum: ['pending', 'paid', 'failed', 'refunded'],
              example: 'pending'
            },
            paymentMethod: { type: 'string', example: 'credit_card' },
            shippingAddress: {
              type: 'object',
              properties: {
                direccion: { type: 'string', example: 'Av. Principal 123' },
                comuna: { type: 'string', example: 'Santiago' },
                region: { type: 'string', example: 'Metropolitana' },
                codigoPostal: { type: 'string', example: '8320000' }
              }
            },
            trackingNumber: { type: 'string', nullable: true },
            notes: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Payment: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            order: { type: 'string', example: '507f1f77bcf86cd799439011' },
            user: { type: 'string', example: '507f1f77bcf86cd799439011' },
            amount: { type: 'number', example: 44980 },
            method: { 
              type: 'string', 
              enum: ['credit_card', 'debit_card', 'webpay', 'mercadopago', 'transferencia'],
              example: 'credit_card'
            },
            gateway: { type: 'string', example: 'webpay' },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
              example: 'completed'
            },
            transactionId: { type: 'string', example: 'TXN-1701542400000' },
            gatewayResponse: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        LoyaltyAccount: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            user: { type: 'string', example: '507f1f77bcf86cd799439011' },
            balance: { type: 'number', example: 1500 },
            totalEarned: { type: 'number', example: 2000 },
            totalRedeemed: { type: 'number', example: 500 },
            tier: {
              type: 'string',
              enum: ['bronze', 'silver', 'gold', 'platinum'],
              example: 'silver'
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        PointsTransaction: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            account: { type: 'string', example: '507f1f77bcf86cd799439011' },
            type: {
              type: 'string',
              enum: ['earn', 'redeem', 'expire', 'adjustment'],
              example: 'earn'
            },
            points: { type: 'number', example: 100 },
            reason: { type: 'string', example: 'Compra de orden ORD-123' },
            order: { type: 'string', nullable: true },
            reward: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Reward: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'Descuento 10%' },
            description: { type: 'string', example: 'Descuento del 10% en tu próxima compra' },
            pointsCost: { type: 'number', example: 500 },
            value: { type: 'number', example: 5000 },
            category: {
              type: 'string',
              enum: ['discount', 'gift', 'shipping'],
              example: 'discount'
            },
            isActive: { type: 'boolean', example: true },
            stock: { type: 'number', example: 100, nullable: true },
            expiryDate: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        RedeemedReward: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            user: { type: 'string', example: '507f1f77bcf86cd799439011' },
            reward: { 
              type: 'object',
              properties: {
                _id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' }
              }
            },
            pointsSpent: { type: 'number', example: 500 },
            couponCode: { type: 'string', example: 'LOYALTY-ABC123' },
            status: {
              type: 'string',
              enum: ['active', 'used', 'expired'],
              example: 'active'
            },
            expiresAt: { type: 'string', format: 'date-time' },
            usedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' }
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

