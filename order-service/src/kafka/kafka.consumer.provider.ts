import { Kafka } from 'kafkajs';

export const kafkaConsumerProvider = {
  provide: 'KAFKA_CONSUMER',
  useFactory: async () => {
    const kafka = new Kafka({
      clientId: 'order-service',
      brokers: ['localhost:9092'],
    });

    const consumer = kafka.consumer({
      groupId: 'order-group',
    });

    await consumer.connect();

    return consumer;
  },
};