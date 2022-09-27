import documentMock from "./dokumentMock";
import logMock from "./logMock";
import tokenMock from "./tokenMock";
export const handlers = [...tokenMock(), ...logMock(), ...documentMock()];
