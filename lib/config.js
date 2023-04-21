var config = {}
config.server={};
config.mq={};

config.server.port = process.env.PORT || 9090;
config.server.loglevel = 1;
config.server.AllowOrigin = ['*'];
config.mq.user = 'ezkwpqqz';
config.mq.pass = 'j3I8Bec5NzMjREgx_jcuzyIygLEEh0ln';
config.mq.server = 'crow-01.rmq.cloudamqp.com';
config.mq.vhost = 'ezkwpqqz';
config.mq.exchangeName="analytics_exchange";
config.mq.exchangeType="direct";
config.mq.exchangeDurable=true;
config.mq.routingKey="analytics_data";
config.mq.queueName="data_queue";

module.exports=config;