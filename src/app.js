const Hapi = require('@hapi/hapi');
const { recommend } = require('./inference');
const { storeData } = require('./store-data.js');
const crypto = require('crypto');

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
                "message": "Payload content size is greater than 1 MB"
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

                const recommendations = await recommend(skills);

                jobs = [];
                for (jobLine of recommendations.slice(0, 10)) {
                    jobs.push(jobLine.split(':')[1].split(',')[0].trim());
                }

                id = crypto.randomUUID();
                recommendData = {
                    "id": id,
                    "skills": skills,
                    "jobs": jobs,
                    "createdAt": new Date()
                };
                await storeData(id, recommendData);

                return h.response({
                    "status": "success",
                    "message": "Jobs are recommended successfully",
                    "data": recommendData
                }).code(201);
            } catch (err) {
                console.log(err);

                return h.response({
                    "status": "fail",
                    "message": "Error when recommending jobs"
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