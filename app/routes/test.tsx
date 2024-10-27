import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div>
      <h1>All Environment Variables</h1>
      <ul>
        {Object.entries(import.meta.env).map(([key, value]) => (
          <li key={key}>
            <strong>{key}</strong>: {String(value)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TestPage;
