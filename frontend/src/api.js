import axios from 'axios';
import { API_BASE } from './lib/constants';

// Projects API
export async function getProjects() {
  const response = await axios.get(`${API_BASE}/api/projects`);
  return response.data;
}

export async function getProject(id) {
  const response = await axios.get(`${API_BASE}/api/projects/${id}`);
  return response.data;
}

export async function createProject(projectData) {
  const response = await axios.post(`${API_BASE}/api/projects`, projectData);
  return response.data;
}

export async function deleteProject(id) {
  const response = await axios.delete(`${API_BASE}/api/projects/${id}`);
  return response.data;
}

// Endpoints API
export async function getEndpoint(id) {
  const response = await axios.get(`${API_BASE}/api/endpoints/${id}`);
  return response.data;
}

export async function createEndpoint(endpointData) {
  const response = await axios.post(`${API_BASE}/api/endpoints`, endpointData);
  return response.data;
}

export async function deleteEndpoint(id) {
  const response = await axios.delete(`${API_BASE}/api/endpoints/${id}`);
  return response.data;
}

export async function generateEndpointTests(id) {
  const response = await axios.post(`${API_BASE}/api/endpoints/${id}/generate-tests`);
  return response.data;
}

export async function getEndpointTestCases(id) {
  const response = await axios.get(`${API_BASE}/api/endpoints/${id}/test-cases`);
  return response.data;
}

// Legacy / General execution APIs (preserved exactly)
export async function generateTests(url, method, body) {
  let parsedBody = undefined;
  if (body) {
    try {
      if (typeof body === 'string') parsedBody = JSON.parse(body);
      else parsedBody = body;
    } catch (e) {
      parsedBody = body;
    }
  }

  const response = await axios.post(`${API_BASE}/generate-tests`, { url, method, body: parsedBody });
  return response.data;
}

export async function runTests(url, method, testCases) {
  const response = await axios.post(`${API_BASE}/run-tests`, { url, method, testCases });
  return response.data;
}

export async function getTestHistory() {
  const response = await axios.get(`${API_BASE}/results`);
  return response.data;
}
