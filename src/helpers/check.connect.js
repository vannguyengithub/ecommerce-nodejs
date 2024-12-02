'use strict';

const mongoose = require('mongoose');
const os = require('os');
const process = require('process');
const _SECOUNDS = 5000;

const countConnect = () => {
    const numConnection = mongoose.connections.length;
    console.log(`Number of connections::${numConnection}`)
}

// check over load 
const checkOverload = () => {
    setInterval(() => {
        const numConnection = mongoose.connections.length
        const numCores = os.cpus().length
        const memoryUsage = process.memoryUsage().rss;

        const maxConnections = numCores * 5;

        console.log(`Active connections::${numConnection}`)
        console.log(`Memory usage::${maxConnections / 1024 / 1024} MB`)

        if(numConnection > maxConnections) {
            console.log(`Connections overload detected!`)
        }
    }, _SECOUNDS)
}

module.exports = {
    countConnect,
    checkOverload
}