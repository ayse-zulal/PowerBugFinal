import { Tldraw } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';

function TldrawCanvas() {
  return (
    <div style={{ position: 'relative', height: 'calc(100vh - 150px)' }}>
      <Tldraw />
    </div>
  );
}

export default TldrawCanvas;