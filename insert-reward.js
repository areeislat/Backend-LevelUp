const mongoose = require('mongoose');
const Reward = require('./src/models/loyalty/Reward'); 
// Asegúrate de poner TU string de conexión real aquí abajo
const MONGODB_URI = 'mongodb+srv://are_isla:F4vrroh70AOLNnaM@cluster0.2ka54bc.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI).then(async () => {
  console.log('Conectado...');

  const premio = await Reward.create({
    name: 'Descuento 10%',
    description: 'Canjea 100 coins por 10% de descuento',
    pointsCost: 100, 
    type: 'discount_percentage',
    value: 10,
    isActive: true
  });

  console.log('RECOMPENSA CREADA. COPIA ESTE ID:', premio._id.toString());
  process.exit();
}).catch(err => console.error(err));