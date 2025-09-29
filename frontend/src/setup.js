// This file sets up the testing environment before any tests run.

import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest'; // Adds helpful testing matchers
import createFetchMock from 'vitest-fetch-mock';
import { vi } from 'vitest';

// Set up a global mock for the `fetch` API so we don't need a running backend for tests
const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

// This automatically runs a cleanup after each test case (e.g., clearing the virtual DOM)
afterEach(() => {
  cleanup();
});

