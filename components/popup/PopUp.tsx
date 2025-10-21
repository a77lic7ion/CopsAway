/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import './PopUp.css';

interface PopUpProps {
  onClose: () => void;
}

const PopUp: React.FC<PopUpProps> = ({ onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Welcome to the Smart Route Planner</h2>
        <div className="popup-scrollable-content">
          <p>
            This demo showcases how Gemini and Google Maps Platform can work together to create intelligent, context-aware routing experiences.
          </p>
          <p>To get started:</p>
          <ol>
            <li>
              <span className="icon">my_location</span>
              <div>Allow location access to set your starting point.</div>
            </li>
            <li>
              <span className="icon">edit_location</span>
              <div>Enter your destination (e.g., "Home") in the input box.</div>
            </li>
            <li>
              <span className="icon">navigation</span>
              <div>Click "Find Route Home" to calculate the best route based on live traffic.</div>
            </li>
            <li>
              <span className="icon">summarize</span>
              <div>Review the turn-by-turn directions and an AI-generated summary of reported incidents along your route.</div>
            </li>
          </ol>
        </div>
        <button onClick={onClose}>Got It, Let's Go!</button>
      </div>
    </div>
  );
};

export default PopUp;
