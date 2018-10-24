function RelayMockNetworkLayerError(errors) {
  const distinctMessages = errors
    .map(e => e.message)
    .filter((value, index, messages) => messages.indexOf(value) === index);
  const instance = new Error(
    'RelayMockNetworkLayerError: ' + distinctMessages.join(' - ')
  );
  instance.originalErrors = errors;
  Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
  if (Error.captureStackTrace) {
    Error.captureStackTrace(instance, RelayMockNetworkLayerError);
  }
  return instance;
}

RelayMockNetworkLayerError.prototype = Object.create(Error.prototype, {
  constructor: {
    value: Error,
    enumerable: false,
    writable: true,
    configurable: true,
  },
});

if (Object.setPrototypeOf) {
  Object.setPrototypeOf(RelayMockNetworkLayerError, Error);
} else {
  RelayMockNetworkLayerError.__proto__ = Error;
}

module.exports = RelayMockNetworkLayerError;
