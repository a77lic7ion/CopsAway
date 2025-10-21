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
 * Unless required by applicable law-or-agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export const INCIDENT_SEARCH_PROMPT = `
Based on the provided route information, act as a traffic watch assistant.
Search for any recent and relevant reports of police activity, speed traps, collisions, or major slowdowns.
Summarize your findings concisely as bullet points. If no specific incidents are found, state that the route looks clear based on available information.
Do not provide navigational directions. Focus only on potential hazards or enforcement activities reported online.
`;
