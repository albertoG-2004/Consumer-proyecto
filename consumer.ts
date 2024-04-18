import amqp from 'amqplib';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function getEvent(){
    const url = process.env.URL ?? "";
    const conn = await amqp.connect(url);
    const channel = await conn.createChannel();

    const exchange = process.env.EXCHANGE ?? "";

    await channel.assertExchange(exchange, 'topic', {durable: true});

    const queueName = 'mqtt';
    const queue = await channel.assertQueue(queueName, {exclusive: false});
    await channel.bindQueue(queue.queue, exchange, '');

    console.log('Listening events of RabbitMQ');

    channel.consume(queue.queue, async(mensaje)=>{
        if(mensaje !== null){
            console.log(`Message received: ${mensaje.content.toString()}`);

            try {
                const weight = Number(mensaje.content);
                if(weight>0){
                    const response = await axios.post('http://localhost:3000/readings',{weight:weight});
                }
            } catch (error) {
                console.log("Error sending to API");   
            }
        }
    }, {noAck:true});
}
getEvent().catch(console.error);