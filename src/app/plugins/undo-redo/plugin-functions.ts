import { registerFunctionDecorator } from '@/features/plugins-core/adapters/adapter-functions';
import { captureSnapshot } from './history-store';

const TRACKED_EVENTS = new Set([
  'addNode',
  'addEdge',
  'delete',
  'nodeDragStart',
  'nodeDragStop',
  'dataUpdate',
  'setDiagramModel',
]);

registerFunctionDecorator('trackFutureChange', {
  place: 'before',
  name: 'UndoRedoHistory',
  callback: ({ params }) => {
    const [changeName] = params as [string];

    if (!TRACKED_EVENTS.has(changeName)) {
      return;
    }

    captureSnapshot();
  },
});
