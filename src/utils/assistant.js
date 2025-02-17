/**
 * Utility module for interacting with the OpenAI Assistant API
 * @module utils
 */

// import OpenAI from "openai";
const {OpenAI} = require("openai");
const {coreHelper} = require('../helpers');
const config = require('../config');

// Initialize OpenAI instance
const openai = new OpenAI({
  organization: config.OPENAI_ORGANIZATION_ID,
  apiKey: config.OPENAI_API_KEY,
});

/**
 * Creates a new thread for conversation with the assistant.
 * @async
 * @returns {Promise<Object>} The newly created thread object.
 */
const createThread = async (metadata) => {
  return openai.beta.threads.create({
    ...(metadata && {metadata})
  });
};

/**
 * Updates a thread with the given OpenAI thread ID and metadata.
 *
 * @param {string} openAiThreadId - The ID of the thread to update.
 * @param {object} metadata - The metadata to update the thread with.
 * @return {Promise<object>} A promise that resolves with the updated thread object.
 */
const updateThread = async (openAiThreadId, metadata) => {
  return openai.beta.threads.update(openAiThreadId, {
    ...(metadata && {metadata})
  });
}

/**
 * Deletes a thread.
 *
 * @param {string} threadId - The ID of the thread to be deleted.
 * @return {APIPromise<ThreadDeleted>} A promise that resolves when the thread is deleted.
 */
const deleteThread = async (threadId) => {
  return openai.beta.threads.del(threadId);
}

/**
 * Adds a user message to the specified thread.
 * @async
 * @param {ObjectId} threadId - The ID of the thread.
 * @param {Object} message - The message to add.
 * @returns {Promise<Object>} The response object.
 */
const addMessageToThread = async (threadId, message) => {
  return openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: message,
  });
};

/**
 * Initiates the assistant on the specified thread.
 * @async
 * @param {string} threadId - The ID of the thread.
 * @param {string} assistantId - The ID of the assistant.
 * @returns {Promise<Object>} The response object.
 */
const runAssistant = async (threadId, assistantId) => {
  return openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
  });
};

/**
 * Retrieves the run object of the specified run.
 * @async
 * @param {string} threadId - The ID of the thread.
 * @param {string} runId - The ID of the run.
 * @returns {Promise<Object>} The run object.
 */
const getRun = async (threadId, runId) => {
  // Retrieve the run object using the threadId and runId
  const run = await openai.beta.threads.runs.retrieve(threadId, runId);

  // Return the entire run object
  return run;
};


/**
 * Retrieves messages from the specified thread.
 * @async
 * @param {string} threadId - The ID of the thread.
 * @returns {Promise<Object>} The response object containing thread messages.
 */
const getThreadMessages = async (threadId) => {
  return openai.beta.threads.messages.list(threadId);
};

/**
 * Extracts the assistant response from the thread messages.
 * @async
 * @param {Object} threadMessages - The thread messages object.
 * @returns {Promise<{id, message}>} The assistant response object.
 */
const getAssistantResponse = async (threadMessages) => {
  return {
    id: threadMessages.data[0].id,
    message: threadMessages.data[0].content[0].text.value
  }
};


const submitToolOutput = async (threadId, runId, toolOutputs) => {
  return await openai.beta.threads.runs.submitToolOutputsAndPoll(
    threadId, runId, toolOutputs
  );
}

module.exports = {
  createThread,
  updateThread,
  deleteThread,
  addMessageToThread,
  runAssistant,
  getRun,
  getThreadMessages,
  getAssistantResponse,
  submitToolOutput
}