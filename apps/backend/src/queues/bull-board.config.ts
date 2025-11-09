import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { Queue } from 'bull';

/**
 * Configuración de Bull Board para monitoreo de colas
 * Proporciona una UI web para visualizar el estado de las colas
 */
export function setupBullBoard(queues: Queue[]) {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  createBullBoard({
    queues: queues.map((queue) => new BullAdapter(queue)),
    serverAdapter,
  });

  return serverAdapter;
}
