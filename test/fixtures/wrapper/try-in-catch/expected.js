try {
  window.errorGlobalHandler = function (e, fn, funName, line, col) {
    console.error(e, fn, funName, line, col);
    goTrackError(e);
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
}
