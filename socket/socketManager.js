let io;

const onlineDrivers = {};
const onlineRiders = {};

const setSocketIO = (socketInstance) => {
  io = socketInstance;
};

const getSocketIO = () => {
  return io;
};

module.exports = {
  setSocketIO,
  getSocketIO,
  onlineDrivers,
  onlineRiders
};