const app = require("./src/app");

const PORT = 8000

const server = app.listen(8000, () => {
    console.log(`WSV eComerce start with port ${PORT}`)
})

// process.on('SIGINT', () => {
//     server.close(() => console.log(`Exit Server Express`))
//     // notify.send(ping...)
// })