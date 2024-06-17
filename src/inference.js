const { PythonShell } = require('python-shell');
const path = require('path');

const pythonPath = 'python3';
const scriptPath = 'models/first.py';

async function recommend(skills) {
    options = {
        pythonPath: pythonPath,
        args: [skills]
    };

    try {
        const results = await PythonShell.run(scriptPath, options);
        return results;
    } catch (err) {
        console.error('Error in Python script:', err);
        throw err;
    }
}

module.exports = { recommend };