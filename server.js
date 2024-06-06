'use strict'



const { httpServer } = require('./src/app');
const {app:{port}}= require('./src/configs/init.config')
const server = httpServer.listen(port, () => {
    console.log(`WSV eCommere start with ${port}`);
});
process.on('SIGINT', () => {
    server.close(() => console.log(`Exit Server Express`));
    // app.notify.send("ping")
})