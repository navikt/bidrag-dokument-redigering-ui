import documentMock from "./dokumentMock";
import forsendelseMock from "./forsendelseMock";
import logMock from "./logMock";
import tokenMock from "./tokenMock";
export const handlers = [...logMock(), ...documentMock(), ...tokenMock(), ...forsendelseMock()];
