const mongoose = require('mongoose');
const Product = require('./src/models/catalog/Product');

// Para correrlo 
// node insert-products.js

// Tu URI de MongoDB
const MONGODB_URI = '';

const productos = [
  {
    productId: "mesa1",
    name: "MTG LOTR Tales of Middle-Earth - Bundle Gift Edition",
    description: "Bundle Gift Edition del set Tales of Middle-Earth de Magic: The Gathering",
    brand: "WIZARDS OF THE COAST",
    price: 515990,
    oldPrice: null,
    image: "/productos/juegos_mesa/MTG1.webp",
    images: ["/productos/juegos_mesa/MTG1.webp"],
    category: "juegos",
    stock: {
      current: 5,
      minLevel: 2,
      maxLevel: 20
    }
  },
  {
    productId: "mesa2",
    name: "Juego de Mesa Pictureka",
    description: "Juego de mesa Pictureka de Hasbro Gaming",
    brand: "HASBRO GAMING",
    price: 12990,
    oldPrice: 14990,
    image: "/productos/juegos_mesa/pictu1.webp",
    images: ["/productos/juegos_mesa/pictu1.webp"],
    category: "juegos",
    stock: {
      current: 2,
      minLevel: 1,
      maxLevel: 10
    }
  },
  {
    productId: "mesa3",
    name: "Juego de Mesa UNO Classic",
    description: "Juego de cartas UNO Classic de Mattel Games",
    brand: "MATTEL GAMES",
    price: 8990,
    oldPrice: null,
    image: "/productos/juegos_mesa/Juego-de-Mesa-Uno-Original.webp",
    images: ["/productos/juegos_mesa/Juego-de-Mesa-Uno-Original.webp"],
    category: "juegos",
    stock: {
      current: 12,
      minLevel: 5,
      maxLevel: 30
    }
  },
  {
    productId: "mesa4",
    name: "Monopoly Classic",
    description: "Juego de mesa Monopoly Classic de Hasbro Gaming",
    brand: "HASBRO GAMING",
    price: 24990,
    oldPrice: 29990,
    image: "/productos/juegos_mesa/mono1-1.webp",
    images: ["/productos/juegos_mesa/mono1-1.webp"],
    category: "juegos",
    stock: {
      current: 0,
      minLevel: 2,
      maxLevel: 15
    }
  },
  {
    productId: "acc1",
    name: "Adaptador tarjeta de red Externa",
    description: "Adaptador de tarjeta de red USB externa de Startech.com",
    brand: "STARTECH.COM",
    price: 29990,
    oldPrice: 49990,
    image: "productos/accesorios/adap1-1.jpg",
    images: ["productos/accesorios/adap1-1.jpg"],
    category: "accesorios",
    stock: {
      current: 8,
      minLevel: 3,
      maxLevel: 20
    }
  },
  {
    productId: "acc2",
    name: "Webcam HD 1080p C920",
    description: "Webcam Logitech HD 1080p modelo C920 para streaming y videoconferencias",
    brand: "LOGITECH",
    price: 89990,
    oldPrice: null,
    image: "productos/accesorios/tmpfrn8w3zz_4416e585_thumbnail_512.jpg",
    images: ["productos/accesorios/tmpfrn8w3zz_4416e585_thumbnail_512.jpg"],
    category: "accesorios",
    stock: {
      current: 2,
      minLevel: 1,
      maxLevel: 10
    }
  },
  {
    productId: "acc3",
    name: "Auriculares Gaming Kraken V3",
    description: "Auriculares gaming Razer Kraken V3 con audio envolvente",
    brand: "RAZER",
    price: 159990,
    oldPrice: 189990,
    image: "productos/accesorios/1_1740759158918.webp",
    images: ["productos/accesorios/1_1740759158918.webp"],
    category: "accesorios",
    stock: {
      current: 0,
      minLevel: 2,
      maxLevel: 10
    }
  },
  {
    productId: "console1",
    name: "PlayStation 5 Console",
    description: "Consola PlayStation 5 con lector de discos de Sony",
    brand: "SONY",
    price: 649990,
    oldPrice: null,
    image: "productos/consolas/6549e34473889022dc3db2a8-playstation-5-ps5-console-disc-version.jpg",
    images: ["productos/consolas/6549e34473889022dc3db2a8-playstation-5-ps5-console-disc-version.jpg"],
    category: "consolas",
    stock: {
      current: 29,
      minLevel: 5,
      maxLevel: 50
    }
  },
  {
    productId: "console2",
    name: "Xbox Series X",
    description: "Consola Xbox Series X de Microsoft con 1TB de almacenamiento",
    brand: "MICROSOFT",
    price: 599990,
    oldPrice: 649990,
    image: "productos/consolas/GUEST_33ae780e-0cd5-4338-b880-9960ba8f5452.avif",
    images: ["productos/consolas/GUEST_33ae780e-0cd5-4338-b880-9960ba8f5452.avif"],
    category: "consolas",
    stock: {
      current: 5,
      minLevel: 2,
      maxLevel: 20
    }
  },
  {
    productId: "console3",
    name: "Nintendo Switch OLED",
    description: "Consola Nintendo Switch modelo OLED con pantalla mejorada",
    brand: "NINTENDO",
    price: 399990,
    oldPrice: null,
    image: "productos/consolas/consola_oled.png",
    images: ["productos/consolas/consola_oled.png"],
    category: "consolas",
    stock: {
      current: 10,
      minLevel: 3,
      maxLevel: 30
    }
  },
  {
    productId: "pc1",
    name: "PC Gamer Omen 45L Intel Core i7",
    description: "PC Gamer HP Omen 45L equipado con Intel Core i7 y tarjeta gráfica de alto rendimiento",
    brand: "HP",
    price: 1299990,
    oldPrice: 1599990,
    image: "productos/computadores/articuno-desktop.png",
    images: ["productos/computadores/articuno-desktop.png"],
    category: "computadores",
    stock: {
      current: 3,
      minLevel: 1,
      maxLevel: 10
    }
  },
  {
    productId: "pc2",
    name: "ROG Strix Gaming Desktop",
    description: "PC Gaming ASUS ROG Strix de alto rendimiento para gaming profesional",
    brand: "ASUS",
    price: 1799990,
    oldPrice: null,
    image: "productos/computadores/52.png",
    images: ["productos/computadores/52.png"],
    category: "computadores",
    stock: {
      current: 7,
      minLevel: 2,
      maxLevel: 15
    }
  },
  {
    productId: "chair1",
    name: "Silla Gaming Titan Evo 2022",
    description: "Silla gaming ergonómica Secretlab Titan Evo 2022 con soporte lumbar",
    brand: "SECRETLAB",
    price: 449990,
    oldPrice: 499990,
    image: "productos/sillas/sillaa321.jpg",
    images: ["productos/sillas/sillaa321.jpg"],
    category: "sillas",
    stock: {
      current: 10,
      minLevel: 3,
      maxLevel: 25
    }
  },
  {
    productId: "chair2",
    name: "Silla Gaming T3 Rush",
    description: "Silla gaming Corsair T3 Rush con diseño ergonómico y comodidad extrema",
    brand: "CORSAIR",
    price: 299990,
    oldPrice: null,
    image: "productos/sillas/1688620156833-MK0CQBWQL6-1-1.webp",
    images: ["productos/sillas/1688620156833-MK0CQBWQL6-1-1.webp"],
    category: "sillas",
    stock: {
      current: 19,
      minLevel: 5,
      maxLevel: 30
    }
  },
  {
    productId: "mouse1",
    name: "Mouse Gaming G502 HERO",
    description: "Mouse gaming Logitech G502 HERO con sensor de 25,600 DPI",
    brand: "LOGITECH",
    price: 79990,
    oldPrice: 99990,
    image: "productos/mouse/w=1500,h=1500,fit=pad.webp",
    images: ["productos/mouse/w=1500,h=1500,fit=pad.webp"],
    category: "mouse",
    stock: {
      current: 4,
      minLevel: 2,
      maxLevel: 15
    }
  },
  {
    productId: "mouse2",
    name: "Mouse Gaming DeathAdder V3",
    description: "Mouse gaming Razer DeathAdder V3 ergonómico de alto rendimiento",
    brand: "RAZER",
    price: 89990,
    oldPrice: null,
    image: "productos/mouse/v3-normal.png",
    images: ["productos/mouse/v3-normal.png"],
    category: "mouse",
    stock: {
      current: 10,
      minLevel: 3,
      maxLevel: 20
    }
  },
  {
    productId: "mousepad1",
    name: "MousePad QcK Gaming XXL",
    description: "MousePad gaming SteelSeries QcK tamaño XXL para máximo espacio de juego",
    brand: "STEELSERIES",
    price: 39990,
    oldPrice: 49990,
    image: "productos/mousepad/mousepad1-1.png",
    images: ["productos/mousepad/mousepad1-1.png"],
    category: "mousepad",
    stock: {
      current: 15,
      minLevel: 5,
      maxLevel: 40
    }
  },
  {
    productId: "mousepad2",
    name: "MousePad MM300 Extended",
    description: "MousePad extendido Corsair MM300 con superficie optimizada para gaming",
    brand: "CORSAIR",
    price: 34990,
    oldPrice: null,
    image: "productos/mousepad/2byzsw6g_ebe13edd_thumbnail_512.jpg",
    images: ["productos/mousepad/2byzsw6g_ebe13edd_thumbnail_512.jpg"],
    category: "mousepad",
    stock: {
      current: 20,
      minLevel: 8,
      maxLevel: 50
    }
  },
  {
    productId: "tshirt1",
    name: "Polera Gaming Personalizada Hombre",
    description: "Polera gaming personalizada para hombre de Level-Up, 100% algodón",
    brand: "LEVEL-UP",
    price: 19990,
    oldPrice: null,
    image: "productos/poleras/poleraNegra2025_800x859.png",
    images: ["productos/poleras/poleraNegra2025_800x859.png"],
    category: "poleras",
    stock: {
      current: 50,
      minLevel: 10,
      maxLevel: 100
    }
  },
  {
    productId: "tshirt2",
    name: "Polera Gaming Personalizada Mujer",
    description: "Polera gaming personalizada para mujer de Level-Up, diseño exclusivo",
    brand: "LEVEL-UP",
    price: 19990,
    oldPrice: 24990,
    image: "productos/poleras/mujerNegra2025_800x943.png",
    images: ["productos/poleras/mujerNegra2025_800x943.png"],
    category: "poleras",
    stock: {
      current: 90,
      minLevel: 15,
      maxLevel: 150
    }
  },
  {
    productId: "hoodie1",
    name: "Polerón Gaming Personalizado Canguro",
    description: "Polerón gaming personalizado estilo canguro de Level-Up con bolsillo frontal",
    brand: "LEVEL-UP",
    price: 39990,
    oldPrice: 49990,
    image: "productos/polerones/poleronCanguroNinoNegro2025_800x878.png",
    images: ["productos/polerones/poleronCanguroNinoNegro2025_800x878.png"],
    category: "polerones",
    stock: {
      current: 9,
      minLevel: 3,
      maxLevel: 50
    }
  },
  {
    productId: "hoodie2",
    name: "Polerón Gaming Personalizado Polo",
    description: "Polerón gaming personalizado estilo polo de Level-Up con diseño moderno",
    brand: "LEVEL-UP",
    price: 39990,
    oldPrice: null,
    image: "productos/polerones/poleronPoloNegro2025_800x800.png",
    images: ["productos/polerones/poleronPoloNegro2025_800x800.png"],
    category: "polerones",
    stock: {
      current: 0,
      minLevel: 3,
      maxLevel: 50
    }
  }
];

async function insertarProductos() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    console.log(`\n📦 Insertando ${productos.length} productos...`);
    
    let insertados = 0;
    let errores = 0;

    for (const producto of productos) {
      try {
        await Product.create(producto);
        console.log(`✅ ${producto.productId} - ${producto.name}`);
        insertados++;
      } catch (error) {
        console.error(`❌ Error en ${producto.productId}: ${error.message}`);
        errores++;
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Insertados: ${insertados}`);
    console.log(`   ❌ Errores: ${errores}`);
    console.log(`   📦 Total: ${productos.length}`);

  } catch (error) {
    console.error('❌ Error general:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

insertarProductos();
