

//Сервіс брокера повідомлень
const amqp = require('amqplib');

let channel = null;
const QUEUE_TO_BUSINESS = 'user_to_business';
const QUEUE_FROM_BUSINESS = 'business_to_user';

async function connectRabbitMQ() {
  const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';

  while (!channel) {
    try {
      const connection = await amqp.connect(rabbitUrl);
      channel = await connection.createChannel();

      await channel.assertQueue(QUEUE_TO_BUSINESS, { durable: false });
      await channel.assertQueue(QUEUE_FROM_BUSINESS, { durable: false });

      console.log('✅ Успішно підключено до RabbitMQ');

      // Прослуховування повідомлень від Бізнес-сервісу
      channel.consume(QUEUE_FROM_BUSINESS, (msg) => {
        if (msg !== null) {
          console.log('📩 [RabbitMQ] Отримано від Бізнес-сервісу:', msg.content.toString());
          channel.ack(msg);
        }
      });
    } catch (error) {
      console.log('⚠️ RabbitMQ ще не готовий. Повторна спроба через 5 секунд...', error.message);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

function sendMessageToBusiness(messageObj) {
  if (!channel) {
    throw new Error('Канал RabbitMQ не готовий');
  }
  const payload = Buffer.from(JSON.stringify(messageObj));
  channel.sendToQueue(QUEUE_TO_BUSINESS, payload);
  console.log('📤 [RabbitMQ] Відправлено в Бізнес-сервіс:', messageObj);
}

module.exports = { connectRabbitMQ, sendMessageToBusiness };