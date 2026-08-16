/**
 * Worker Pipeline Queue and Event Message Contracts
 * Based on UniHack Backend Spec Section 135
 */

import { ProcessingStage } from '../domain/enums';

/**
 * Message payload passed between processing stages via Azure Service Bus.
 */
export interface StageMessage {
  messageVersion: number;
  jobId: string;
  rowId: number;
  stage: ProcessingStage | string;
  attempt: number;
  correlationId: string;
  payload?: Record<string, unknown>;
  createdAt: string; // ISO-8601
}
