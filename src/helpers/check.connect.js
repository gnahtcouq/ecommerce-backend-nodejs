'use strict'
const mongoose = require('mongoose')
const os = require('os')
const process = require('process')
const _SECONDS = 5000

// count Connect
const countConnect = () => {
    const numConnection = mongoose.connect.length
    console.log(`Number of connections::${numConnection}`)
    return numConnection
}

// check over load
const checkOverload = () => {
    setInterval(() => {
        const numConnection = mongoose.connect.length
        const numCores = os.cpus().length
        const memoryUsage = process.memoryUsage().rss
        // Example maximum number of connections based on numbers osf cores
        const maxConnections = numCores * 5;

        console.log(`Active connections: ${numConnection}`)
        console.log(`Memory usage:: ${memoryUsage / 1024 / 1024} MB`)

        if (numConnection > maxConnections) {
            console.log(`Connection overload detected!`)
            // notify.send(...)
        }
    }, _SECONDS) // Monitor every 5 seconds
}

module.exports = {
    countConnect,
    checkOverload
}