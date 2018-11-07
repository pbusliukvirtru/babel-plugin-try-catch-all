try {
  window.errorGlobalHandler = function (error, context, functionName, line, col) {
    goTrackError(error, context, functionName);
  };

  try {
    undefined();
  } catch (e) {
    e._r = true;

    console.log(e);
    if (Math.random() < .5) {
      delete e._r;

      throw e;
    }
    try {
      undefined();
    } catch (e) {
      e._r = true;

      console.log(e);
    }
  }
} catch (_e) {
  reportError(_e, "wrapper/try-in-catch/expected.js", "top-level code", 1, 0);
  throw _e;
}
