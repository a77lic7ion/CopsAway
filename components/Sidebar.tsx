/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import ControlTray, { ControlTrayProps } from './ControlTray';
import StreamingConsole from './streaming-console/StreamingConsole';

export default function Sidebar({ onFindRoute, onFindLocation }: ControlTrayProps) {
  return (
    <aside className={'sidebar open'}>
      <div className="sidebar-content-planner">
        <ControlTray onFindRoute={onFindRoute} onFindLocation={onFindLocation} />
        <div className="results-divider"></div>
        <StreamingConsole />
      </div>
    </aside>
  );
}
