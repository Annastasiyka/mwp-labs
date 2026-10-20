

// Сервіс для взаємодії з RabbitMQ
const amqp = require('amqplib');
const History = require('../models/History');

let channel = null;
const QUEUE_FROM_USER = 'user_to_business';
const QUEUE_TO_USER = 'business_to_user';

async function connectRabbitMQ() {
  const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';

  while (!channel) {
    try {
      const connection = await amqp.connect(rabbitUrl);
      channel = await connection.createChannel();

      await channel.assertQueue(QUEUE_FROM_USER, { durable: false });
      await channel.assertQueue(QUEUE_TO_USER, { durable: false });

      console.log('✅ Бізнес-сервіс успішно підключено до RabbitMQ');

      // Зчитування повідомлень від User Service (Автоматичний Soft Delete)
      channel.consume(QUEUE_FROM_USER, async (msg) => {
        if (msg !== null) {
          const content = msg.content.toString();
          console.log('📩 [RabbitMQ] Отримано від Користувацького сервісу:', content);

          try {
            const data = JSON.parse(content);
            if (data.action === 'DELETE_USER') {
              await History.updateMany(
                { userId: data.userId },
                { $set: { isDeleted: true } }
              );
              console.log(`🧹 [Soft Delete] Успішно приховано історію переглядів користувача ID: ${data.userId}`);
            }
          } catch (e) {
            console.log('⚠️ Отримано текстове повідомлення не в форматі JSON');
          }
          channel.ack(msg);
        }
      });
    } catch (error) {
      console.log('⚠️ RabbitMQ ще не готовий. Повторна спроба через 5 секунд...', error.message);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

function sendMessageToUser(messageObj) {
  if (!channel) {
    throw new Error('Канал RabbitMQ не готовий');
  }
  const payload = Buffer.from(JSON.stringify(messageObj));
  channel.sendToQueue(QUEUE_TO_USER, payload);
  console.log('📤 [RabbitMQ] Відправлено в Користувацький сервіс:', messageObj);
}

module.exports = { connectRabbitMQ, sendMessageToUser };