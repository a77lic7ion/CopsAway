/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

export default function ErrorScreen({ customError, clearError }: { customError: string | null; clearError: () => void; }) {
  if (!customError) {
    return null;
  }

  return (
    <div className="error-screen">
      <div
        style={{
          fontSize: 48,
        }}
      >
        💔
      </div>
      <div
        className="error-message-container"
        style={{
          fontSize: 22,
          lineHeight: 1.2,
          opacity: 0.8,
          textAlign: 'center',
          maxWidth: '80%',
        }}
      >
        {customError}
      </div>
      <button
        className="close-button"
        onClick={clearError}
      >
        Close
      </button>
    </div>
  );
}
