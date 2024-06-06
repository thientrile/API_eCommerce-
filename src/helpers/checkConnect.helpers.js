'use strict'
const mongoose = require('mongoose')
const __SECONDS = 5000
const os = require('os')
const proces = require('process')
//  count connections
const countConnect = () => {
  const numConnections = mongoose.connections.length
  console.log(`Number of connections: ${numConnections}`)
}
//  check overload
const checkOverload = () => {
  setInterval(() => {
    const numConnections = mongoose.connections.length
    const numCores = os.cpus().length
    const useMemory = proces.memoryUsage().rss
    console.log(`Memory usage:: ${useMemory / 1024 / 1024} mb`)
    // Example maximum number of connections based on number osf cores
    const maximumConnections = numCores * 5
    if (numConnections > maximumConnections) {
      console.log('Connection overloaded detected')
    }
  }, __SECONDS) // Monitor every 5 seconds
}
module.exports = {
  countConnect,
  checkOverload
}