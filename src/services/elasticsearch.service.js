"use strict";
const { getClient, closeClient } = require("../db/elasticSearch.db");

const esClient = getClient().elasticClient;

const searchDocument = async (query) => {
  try {
    const result = await esClient.search({ query });
    console.log(`Search results: ${JSON.stringify(result?.body?.hits?.hits)}`);
    return result?.body?.hits?.hits || [];
  } catch (err) {
    console.error("Error searching documents:", err);
    return null;
  } 
};

const addDocument = async ({ index, id, payload }) => {
  try {
    const newDoc = await esClient.index({
      index,
      id,
      document: payload,
    });
    console.log(`New Document added: ${JSON.stringify(newDoc)}`);
    return newDoc;
  } catch (err) {
    console.error("Error adding document:", err);
    return null;
  } 
};

const getDocument = async ({ index, id }) => {
  try {
    const doc = await esClient.get({
      index,
      id,
    });
    console.log(`Document retrieved: ${JSON.stringify(doc.body)}`);
    return doc.body;
  } catch (err) {
    console.error("Error retrieving document:", err);
    return null;
  } 
};

const updateDocument = async ({ index, id, payload }) => {
  try {
    const updatedDoc = await esClient.update({
      index,
      id,
      document: payload,
    });
    console.log(`Document updated: ${JSON.stringify(updatedDoc.body)}`);
    return updatedDoc.body;
  } catch (err) {
    console.error("Error updating document:", err);
    return null;
  } 
};

const deleteDocument = async ({ index, id }) => {
  try {
    const deletedDoc = await esClient.delete({
      index,
      id,
    });
    console.log(`Document deleted: ${JSON.stringify(deletedDoc._index)}`);
    return deletedDoc;
  } catch (err) {
    console.error("Error deleting document:", err);
    return null;
  } 
};

const deleteIndex = async ({ index }) => {
  try {
    const deletedIndex = await esClient.indices.delete({ index });
    console.log(`Index deleted: ${JSON.stringify(deletedIndex.body)}`);
    return deletedIndex.body;
  } catch (err) {
    console.error("Error deleting index:", err);
    return null;
  } 
};

const updateByQueryDocument = async ({ index, payload }) => {
  try {
    const updatedDoc = await esClient.updateByQuery({
      index,
      body: payload,
    });
    console.log(`Documents updated by query: ${JSON.stringify(updatedDoc.body)}`);
    return updatedDoc.body;
  } catch (err) {
    console.error("Error updating documents by query:", err);
    return null;
  } 
};

module.exports = {
  searchDocument,
  addDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  deleteIndex,
  updateByQueryDocument,
};
