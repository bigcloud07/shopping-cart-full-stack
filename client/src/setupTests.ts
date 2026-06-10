import "@testing-library/jest-dom";
import { server } from "./mocks/server";
import { resetCartItems } from "./mocks/handlers";

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  resetCartItems();
});
afterAll(() => server.close());
