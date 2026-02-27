import { Kafka } from 'kafkajs';

export const kafkaProducerProvider = {
  provide: 'KAFKA_PRODUCER',
  useFactory: async () => {
    const kafka = new Kafka({
      brokers: ['localhost:9092'],
    });

    const producer = kafka.producer();
    await producer.connect();

    return producer;
  },
};