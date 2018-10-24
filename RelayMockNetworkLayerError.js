class RelayMockNetworkLayerError extends Error {
    constructor(errors) {
        const distinctMessages = errors
            .map(e => e.message)
            .filter((value, index, messages) => messages.indexOf(value) === index);
        super("RelayMockNetworkLayerError: " + distinctMessages.join(" - "));
        this.originalErrors = errors;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

module.exports = RelayMockNetworkLayerError;