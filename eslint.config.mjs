import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

export default [
  ...nextCoreWebVitals,
  {
    rules: {
      // Standard React pattern: reading from localStorage/window in useEffect
      // and setting initial state is intentional in this codebase
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
];
