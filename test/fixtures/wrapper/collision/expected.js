var _e = '_e cannnot be used in catch clause';

try {
  console.log(_e);

  function _e2() {
    try {
      var _e3 = '_e3 cannot be used in catch clause';
      console.log(_e3);
    } catch (_e4) {
      errorGlobalHandler(_e4, 'wrapper/collision/expected.js', '_e2', 6, 1);
      throw _e4;
    }
  }
} catch (e) {
  e._r = true;

  console.log(e);
}

window.errorGlobalHandlerOpts = {
  timeout: null,
  errors: [],
  sentInterval: 500
};
window.errorGlobalHandler = function (error, context, functionName, line, col) {
  const newError = {
    error: JSON.stringify(error),
    context: context,
    functionName: functionName,
    line: line,
    col: col
  };

  function isErrorAlreadyPresent() {
    return errorGlobalHandlerOpts.errors.filter(function (existingError) {
      return existingError.error === newError.error;
    }).length;
  }

  if (isErrorAlreadyPresent()) {
    return;
  }

  errorGlobalHandlerOpts.errors.push(newError);

  if (errorGlobalHandlerOpts.timeout) {
    clearTimeout(window.errorGlobalHandlerOpts.timeout);
  }

  errorGlobalHandlerOpts.timeout = setTimeout(function () {
    errorGlobalHandlerOpts.errors.forEach(function (existingError) {
      window.top.postMessage({
        type: 'driveUnhandledError',
        messageType: 'trackAnalytic',
        options: existingError
      }, '*');
    });
    errorGlobalHandlerOpts.errors = [];
    errorGlobalHandlerOpts.timeout = null;
  }, errorGlobalHandlerOpts.sentInterval);
};
