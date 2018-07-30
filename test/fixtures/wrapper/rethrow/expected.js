try {
  window.errorGlobalHandler = function (e, fn, funName, line, col) {
    console.error(e, fn, funName, line, col);
    Analytics.goTrack(e);
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
}
