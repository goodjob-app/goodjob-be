const Hapi = require('@hapi/hapi');
const { recommend } = require('./inference');

(async () => {
    const server = Hapi.server({
        host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
        port: 8000,
        routes: {
            cors: {
              origin: ['*'],
            },
        },
    });

    server.ext('onPreResponse', (request, h) => {
        const response = request.response;
        if (response.isBoom && response.output.statusCode === 413) {
            return h.response({
                "status": "fail",
                "message": "Payload content length greater than maximum allowed: 1000000"
             }).code(413);
        }
        return h.continue;
    });

    server.route({
        method: 'POST',
        path: '/recommend',
        handler: async (request, h) => {
            try {
                const { skills } = request.payload;

                console.log(skills)

                const recommendations = await recommend(skills);

                console.log(recommendations)
            } catch (err) {
                console.log(err);

                return h.response({
                    "status": "fail",
                    "message": "Terjadi kesalahan dalam melakukan prediksi"
                }).code(400);
            }
        },
        
        options: {
            payload: {
                allow: 'multipart/form-data',
                multipart: true,
                maxBytes: 1000000
            }
        }
    });

    await server.start();

    console.log(`Server start at: ${server.info.uri}`);
})();