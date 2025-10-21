/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useState, FormEvent, memo } from 'react';
import { useLocationStore, useRouteStore } from '@/lib/state';

export type ControlTrayProps = {
  onFindRoute: (destination: string) => void;
};

function ControlTray({ onFindRoute }: ControlTrayProps) {
  const [destination, setDestination] = useState('');
  const { loading } = useRouteStore();
  const { origin, locationError } = useLocationStore();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!destination.trim() || loading) return;
    onFindRoute(destination);
  };

  const getLocationValue = () => {
    if (locationError) return locationError;
    if (origin) return 'Your Current Location';
    return 'Fetching location...';
  };

  return (
    <section className="control-tray-planner">
      <h3 className="control-tray-title">Route Planner</h3>
      <p className="control-tray-subtitle">
        Enter your destination to find the best route home, optimized for current traffic conditions.
      </p>
      <form className="route-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <span className="icon">my_location</span>
          <input
            type="text"
            className={`route-input ${locationError ? 'input-error' : ''}`}
            value={getLocationValue()}
            aria-label="Starting point: Your Current Location"
            disabled
            readOnly
          />
        </div>
        <div className="input-group">
          <span className="icon">home</span>
          <input
            type="text"
            className="route-input"
            placeholder="Enter Home Address"
            value={destination}
            onChange={e => setDestination(e.target.value)}
            aria-label="Home Address"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="route-button"
          disabled={!destination.trim() || loading}
          aria-label="Find Route Home"
        >
          {loading ? 'Finding...' : 'Find Route Home'}
          <span className="icon">navigation</span>
        </button>
      </form>
    </section>
  );
}

export default memo(ControlTray);