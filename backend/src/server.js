import expresss from 'express';
import { ENV } from './lib/env.js';

const app = expresss();

console.log('Port:', ENV.PORT);

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
})

app.listen(ENV.PORT, () => {
    console.log('Server is running on port', ENV.PORT);
});

