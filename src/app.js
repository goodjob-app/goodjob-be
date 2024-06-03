const Hapi = require('@hapi/hapi');
const { loadModel } = require('./inference');

(async () => {
    const model = await loadModel();
    console.log('Model loaded!');
    
    const server = Hapi.server({
        host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
        port: 8000
    });

    await server.start();

    console.log(`Server start at: ${server.info.uri}`);
})();