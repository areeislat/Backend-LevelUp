const mongoose = require('mongoose');
const Category = require('./src/models/catalog/Category');

// Para correrlo 
// node insert-categories.js

// Tu URI de MongoDB
const MONGODB_URI = 'mongodb+srv://are_isla:F4vrroh70AOLNnaM@cluster0.2ka54bc.mongodb.net/ecommerce?retryWrites=true&w=majority';

const categorias = [
  {
    name: "Juegos de Mesa",
    slug: "juegos",
    description: "Juegos de mesa, cartas coleccionables y entretenimiento de mesa",
    icon: "🎲"
  },
  {
    name: "Accesorios",
    slug: "accesorios",
    description: "Accesorios para gaming y computación",
    icon: "🎧"
  },
  {
    name: "Consolas",
    slug: "consolas",
    description: "Consolas de videojuegos de última generación",
    icon: "🎮"
  },
  {
    name: "Computadores",
    slug: "computadores",
    description: "PC Gaming de alto rendimiento",
    icon: "💻"
  },
  {
    name: "Sillas Gaming",
    slug: "sillas",
    description: "Sillas ergonómicas para gaming y oficina",
    icon: "🪑"
  },
  {
    name: "Mouse",
    slug: "mouse",
    description: "Mouse gaming de alta precisión",
    icon: "🖱️"
  },
  {
    name: "Mousepad",
    slug: "mousepad",
    description: "Mousepad gaming de diferentes tamaños",
    icon: "📄"
  },
  {
    name: "Poleras",
    slug: "poleras",
    description: "Poleras gaming personalizadas",
    icon: "👕"
  },
  {
    name: "Polerones",
    slug: "polerones",
    description: "Polerones gaming personalizados",
    icon: "🧥"
  }
];

async function insertarCategorias() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    console.log(`\n📦 Insertando ${categorias.length} categorías...`);
    
    let insertados = 0;
    let errores = 0;

    for (const categoria of categorias) {
      try {
        await Category.create(categoria);
        console.log(`✅ ${categoria.slug} - ${categoria.name}`);
        insertados++;
      } catch (error) {
        console.error(`❌ Error en ${categoria.slug}: ${error.message}`);
        errores++;
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Insertados: ${insertados}`);
    console.log(`   ❌ Errores: ${errores}`);
    console.log(`   📦 Total: ${categorias.length}`);

  } catch (error) {
    console.error('❌ Error general:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

insertarCategorias();
