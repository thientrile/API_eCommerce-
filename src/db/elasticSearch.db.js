"use strict";

const { Client } = require("@elastic/elasticsearch");
const { ElasticsearchErrorRespoint } = require("../core/error.response"); // Assuming you have a custom error response module
const env = process.env;
let clients = {}; // Multiple clients for multiple connections

const instanceEventListeners = async (elasticClient) => {
  try {
    await elasticClient.ping();
    console.log("connecting Elasticsearch - connecting Status: Connnected");
  } catch (err) {
    console.error("Error: Connection to Elasticsearch failed", err);
  }
};

const init = (is_enable = 1) => {
  const isEnabled = env.ELASTICSEARCH_IS_ENABLED || is_enable;
  
  if (isEnabled == 1) {
    try {
      const elasticClient = new Client({
        node: env.ELASTICSEARCH_HOST,
        auth: {
          username: env.ELASTICSEARCH_USERNAME,
          password: env.ELASTICSEARCH_PASSWORD,
        },
        tls: {
          // ca: fs.readFileSync('./http_ca.crt'),
          rejectUnauthorized: false, // Use only in development
        },
      });
      clients.elasticClient = elasticClient;
      instanceEventListeners(elasticClient);
    } catch (err) {
      console.error("Error initializing Elasticsearch client", err);
    }
  } else {
    console.log("Elasticsearch is disabled");
  }
};

const getClient = () => clients;

const closeClient = async () => {
  if (clients.elasticClient) {
    try {
      await clients.elasticClient.close();
      console.log("Elasticsearch client closed successfully.");
    } catch (err) {
      console.error("Error closing Elasticsearch client", err);
    }
  }
};

module.exports = {
  init,
  getClient,
  closeClient,
};
