/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useRouteStore } from '@/lib/state';

function DirectionsPanel({ directions }: { directions: google.maps.DirectionsResult }) {
  const leg = directions.routes[0].legs[0];

  return (
    <div className="directions-panel">
      <h3>Directions</h3>
      <div className="route-summary">
        <p><strong>From:</strong> {leg.start_address}</p>
        <p><strong>To:</strong> {leg.end_address}</p>
        <p><strong>Distance:</strong> {leg.distance?.text} | <strong>Duration:</strong> {leg.duration?.text}</p>
        {leg.duration_in_traffic && (
          <p className="traffic-duration">Duration in Traffic: {leg.duration_in_traffic.text}</p>
        )}
      </div>
      <ol className="steps-list">
        {leg.steps.map((step, index) => (
          <li key={index} className="step-item">
            <div className="step-icon">
              <span className="icon">arrow_forward</span>
            </div>
            <div className="step-details">
              <div
                className="step-instructions"
                dangerouslySetInnerHTML={{ __html: step.instructions }}
              />
              <div className="step-distance">{step.distance?.text}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}


export default function StreamingConsole() {
  const { directions, incidents, loading } = useRouteStore();

  return (
    <div className="results-container">
      {loading && (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Calculating best route...</p>
        </div>
      )}
      {!loading && !directions && (
        <div className="placeholder-container">
          <span className="icon placeholder-icon">route</span>
          <p>Your route information will appear here.</p>
        </div>
      )}
      {directions && (
        <div className="results-view">
          {incidents && (
            <div className="incidents-panel">
              <h3><span className="icon">warning</span>Incident Report</h3>
              <div className="incidents-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {incidents}
                </ReactMarkdown>
              </div>
            </div>
          )}
          <DirectionsPanel directions={directions} />
        </div>
      )}
    </div>
  );
}
