try {
  window.errorGlobalHandler = function (error, context, functionName, line, col) {
    goTrackError(error, context, functionName);
  };

  try {
    undefined();
  } catch (e) {
    e._r = true;

    console.log(e);
    delete e._r;
    throw e;
  }
} catch (_e) {
  reportError(_e, "wrapper/rethrow/expected.js", "top-level code", 1, 0);
  throw _e;
}
