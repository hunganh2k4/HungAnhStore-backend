import { Kafka } from 'kafkajs';

export const kafkaProducerProvider = {
  provide: 'KAFKA_PRODUCER',
  useFactory: async () => {
    const kafka = new Kafka({
      clientId: 'payment-service',
      brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
    });

    const producer = kafka.producer();
    await producer.connect();

    return producer;
  },
};
