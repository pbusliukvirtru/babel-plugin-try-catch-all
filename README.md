Purpose of this module:
For global catch uncaught errors due to use virtru google drive extension 
and sending all errors to analytics service

Usage for webpack plugin:


```javascript
...
moduleRules: [
    {
      test: /\.js$/,
      ...
      loader: 'babel-loader',
      options: {
        sourceType: 'module',
        presets: ['es2015', 'es2016', 'es2017', 'stage-0'],
        plugins: [
          'transform-runtime',
          // For imports and exports to convert them to require and module.exports
          'transform-es2015-modules-commonjs',
          // Adds try-catch blocks for to each file for global error handling
          ['babel-plugin-try-catch-all', {
            // Name of function to catch global uncaught error
            reportError: 'errorGlobalHandler' 
          }],
          // Adds analytic to each file for global error handling
          ['provide-modules', {
            'virtru-drive-analytics': ['goTrackError'],
          }],
        ],
      }
    },
   ...
  ]
  ...
```