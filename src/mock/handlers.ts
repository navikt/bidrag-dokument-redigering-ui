import documentMock from "./dokumentMock";
import logMock from "./logMock";
export const handlers = [...logMock(), ...documentMock()];
