import documentMock from "./dokumentMock";
import forsendelseMock from "./forsendelseMock";
import logMock from "./logMock";
export const handlers = [...documentMock(), ...forsendelseMock(), ...logMock()];
// export const handlers = [...logMock(), ...documentMock(), ...tokenMock(), ...forsendelseMock()];
