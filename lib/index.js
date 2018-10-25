'use strict';

exports.__esModule = true;
exports.version = undefined;

var _package = require('../package.json');

Object.defineProperty(exports, 'version', {
  enumerable: true,
  get: function get() {
    return _package.version;
  }
});

var _babelHelperFunctionName = require('babel-helper-function-name');

var _babelHelperFunctionName2 = _interopRequireDefault(_babelHelperFunctionName);

var _babelTemplate = require('babel-template');

var _babelTemplate2 = _interopRequireDefault(_babelTemplate);

var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
stack format:
${error.name}: ${error.message}
  at ${functionName} (${fileNameOrUrl}:line:column)
  at ${functionName} (${fileNameOrUrl}:line:column)
  .
  .
  .
*/

var wrapProgram = (0, _babelTemplate2.default)('\n  BODY\n  window.errorGlobalHandlerOpts = {\n    timeout: null,\n    errors: [],\n    sentInterval: 500\n  };\n  window.errorGlobalHandler = function(error, context, functionName, line, col) {\n    const newError = {\n        error: JSON.stringify(error),\n        context: context,\n        functionName: functionName,\n        line: line,\n        col: col\n    };\n    \n    function isErrorAlreadyPresent() {\n      return errorGlobalHandlerOpts.errors.filter(function(existingError) {\n        return existingError.error === newError.error;\n      }).length;\n    }\n    \n    if (isErrorAlreadyPresent()) {\n        return;\n    }\n  \n    errorGlobalHandlerOpts.errors.push(newError);\n    \n    if (errorGlobalHandlerOpts.timeout) {\n      clearTimeout(window.errorGlobalHandlerOpts.timeout);\n    }\n    \n    errorGlobalHandlerOpts.timeout = setTimeout(function(){ \n        errorGlobalHandlerOpts.errors.forEach(function(existingError) {\n          window.top.postMessage({\n            type: \'driveUnhandledError\',\n            messageType: \'trackAnalytic\',\n            options: existingError\n          }, \'*\');\n        });\n        errorGlobalHandlerOpts.errors = [];\n        errorGlobalHandlerOpts.timeout = null;\n    }, errorGlobalHandlerOpts.sentInterval);\n  };\n');

var wrapFunction = (0, _babelTemplate2.default)('{\n  try {\n    BODY\n  } catch(ERROR_VARIABLE_NAME) {\n    REPORT_ERROR(ERROR_VARIABLE_NAME, FILENAME, FUNCTION_NAME, LINE, COLUMN);\n    throw ERROR_VARIABLE_NAME\n  }\n}');

var markErrorResolved = (0, _babelTemplate2.default)('\n  ERROR._r = true\n');

var markErrorUnresolved = (0, _babelTemplate2.default)('\n  delete ERROR._r\n');

var shouldSkip = function () {
  var records = new Map();

  return function (path, state) {
    if (state.end) {
      return true;
    }

    // ignore generated code
    if (!path.node.loc) {
      return true;
    }

    // ignore processed nodes
    var nodeType = path.node.type;
    if (!records.has(nodeType)) {
      records.set(nodeType, new Set());
    }
    var recordsOfThisType = records.get(nodeType);
    var sourceLocation = filename + ':' + path.node.start + '-' + path.node.end;
    var hasRecord = recordsOfThisType.has(sourceLocation);
    recordsOfThisType.add(sourceLocation);
    return hasRecord;
  };
}();

// filename of which is being processed
var filename = void 0;

// function name reporting error, default: 'reportError'
var reportError = void 0;

exports.default = {
  pre: function pre(file) {
    var _opts$reportError = this.opts.reportError;
    reportError = _opts$reportError === undefined ? 'reportError' : _opts$reportError;


    filename = this.opts.filename || file.opts.filenameRelative;
    if (!filename || filename.toLowerCase() === 'unknown') {
      throw new Error('babel-plugin-try-catch-all: If babel cannot grab filename, you must pass it in');
    }
  },

  visitor: {
    Program: {
      exit: function exit(path, state) {
        if (state.end) {
          return;
        }
        state.end = true;

        var body = path.node.body;
        if (body.length === 0) {
          return;
        }

        var loc = path.node.loc;
        var errorVariableName = path.scope.generateUidIdentifier('e');

        var programBody = wrapProgram({
          BODY: body,
          FILENAME: t.StringLiteral(filename),
          FUNCTION_NAME: t.StringLiteral('top-level code'),
          LINE: t.NumericLiteral(loc.start.line),
          COLUMN: t.NumericLiteral(loc.start.column),
          REPORT_ERROR: t.identifier(reportError),
          ERROR_VARIABLE_NAME: errorVariableName
        });
        path.replaceWith(t.Program(programBody));
      }
    },
    Function: {
      exit: function exit(path, state) {
        if (shouldSkip(path, state)) {
          return;
        }

        // ignore empty function body
        var body = path.node.body;
        if (body.length === 0) {
          return;
        }

        var functionName = 'anonymous function';
        if (path.node.type === 'FunctionDeclaration') {
          functionName = path.node.id.name;
        } else {
          var newFunction = (0, _babelHelperFunctionName2.default)(path);
          if (newFunction && newFunction.id) {
            functionName = newFunction.id.name;
          }
        }

        var loc = path.node.loc;
        var errorVariableName = path.scope.generateUidIdentifier('e');

        path.get('body').replaceWith(wrapFunction({
          BODY: body,
          FILENAME: t.StringLiteral(filename),
          FUNCTION_NAME: t.StringLiteral(functionName),
          LINE: t.NumericLiteral(loc.start.line),
          COLUMN: t.NumericLiteral(loc.start.column),
          REPORT_ERROR: t.identifier(reportError),
          ERROR_VARIABLE_NAME: errorVariableName
        }));
      }
    },
    CatchClause: {
      enter: function enter(path, state) {
        if (shouldSkip(path, state)) {
          return;
        }

        // variable name of error caught
        var errorVariableName = path.node.param.name;

        path.node.body.body.unshift(markErrorResolved({
          ERROR: t.Identifier(errorVariableName)
        }));
      }
    },
    ThrowStatement: {
      enter: function enter(path, state) {
        if (shouldSkip(path, state)) {
          return;
        }

        var error = path.node.argument;
        if (error.type === 'Identifier') {
          path.insertBefore(markErrorUnresolved({
            ERROR: t.Identifier(error.name)
          }));
        }
      }
    }
  }
};