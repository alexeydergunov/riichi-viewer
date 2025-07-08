import { useState, useRef, useEffect } from 'react'
import './App.css'
import { Board } from './Board';
import { TileImage } from './TileImage';

function App() {
  const [logText, setLogText] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewedPlayer, setViewedPlayer] = useState<number>(0); // 0 = default viewed player
  const [showAllHands, setShowAllHands] = useState(false);

  // For autoscroll
  const logLineRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (logLineRefs.current[currentIndex]) {
      logLineRefs.current[currentIndex]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [currentIndex, events.length]);

  // Function to get the current round result (only if current event is hora/ryukyoku/end_kyoku)
  const getCurrentRoundResult = () => {
    if (events.length === 0 || currentIndex >= events.length) return null;
    
    const currentEvent = events[currentIndex];
    let resultEvent = null;
    
    if (currentEvent.type === 'hora' || currentEvent.type === 'ryukyoku') {
      resultEvent = currentEvent;
    } else if (currentEvent.type === 'end_kyoku') {
      // Find the hora or ryukyoku event that ended this round
      for (let i = currentIndex - 1; i >= 0; i--) {
        if (events[i].type === 'hora' || events[i].type === 'ryukyoku') {
          resultEvent = events[i];
          break;
        }
      }
    } else {
      return null;
    }
    
    if (!resultEvent) return null;
    
    // Get player names
    let names = ['Player 0', 'Player 1', 'Player 2', 'Player 3'];
    for (let i = 0; i < events.length; i++) {
      if (events[i].type === 'start_game' && events[i].names) {
        names = events[i].names;
        break;
      }
    }
    
    return {
      type: resultEvent.type,
      actor: resultEvent.actor,
      target: resultEvent.target,
      deltas: resultEvent.deltas,
      uraMarkers: resultEvent.ura_markers || [],
      names: names
    };
  };

  const roundResult = getCurrentRoundResult();

  // Compute which hands should be revealed for the current event
  const getHandsRevealed = () => {
    if (showAllHands) return [true, true, true, true];
    if (events.length === 0 || currentIndex >= events.length) return [false, false, false, false];
    let currentEvent = events[currentIndex];
    // If end_kyoku, look back to the most recent hora/ryukyoku
    if (currentEvent.type === 'end_kyoku') {
      for (let i = currentIndex - 1; i >= 0; i--) {
        if (events[i].type === 'hora' || events[i].type === 'ryukyoku') {
          currentEvent = events[i];
          break;
        }
      }
    }
    // Always show viewed player's hand
    const arr = [false, false, false, false];
    arr[viewedPlayer] = true;
    if (currentEvent.type === 'hora') {
      arr[currentEvent.actor] = true;
    } else if (currentEvent.type === 'ryukyoku') {
      if (Array.isArray(currentEvent.tenpais)) {
        currentEvent.tenpais.forEach((i: number) => { arr[i] = true; });
      }
    }
    return arr;
  };
  const handsRevealed = getHandsRevealed();

  const handleLoadLog = () => {
    try {
      const lines = logText.split('\n').filter(line => line.trim() !== '');
      const parsed = lines.map(line => JSON.parse(line));
      setEvents(parsed);
      setError(null);
      setCurrentIndex(0);
    } catch (e) {
      setError('Failed to parse log. Please check the format.');
      setEvents([]);
    }
  };

  // Navigation handlers
  const goToPrev = () => setCurrentIndex(i => Math.max(i - 1, 0));
  const goToNext = () => setCurrentIndex(i => Math.min(i + 1, events.length - 1));

  // Player/round navigation
  const goToPrevPlayerTurn = () => {
    if (viewedPlayer === null || events.length === 0) return;
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (events[i].actor === viewedPlayer) {
        setCurrentIndex(i);
        return;
      }
    }
  };
  const goToNextPlayerTurn = () => {
    if (viewedPlayer === null || events.length === 0) return;
    for (let i = currentIndex + 1; i < events.length; i++) {
      if (events[i].actor === viewedPlayer) {
        setCurrentIndex(i);
        return;
      }
    }
  };
  const goToPrevRound = () => {
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (events[i].type === 'start_kyoku') {
        setCurrentIndex(i);
        return;
      }
    }
  };
  const goToNextRound = () => {
    for (let i = currentIndex + 1; i < events.length; i++) {
      if (events[i].type === 'start_kyoku') {
        setCurrentIndex(i);
        return;
      }
    }
  };

  return (
    <div className="app-root" style={{ display: 'flex', minHeight: '100vh', background: '#f7f7f7', justifyContent: 'center', alignItems: 'stretch' }}>
      {/* Left: Log input */}
      <div style={{ flex: '0 0 300px', padding: '1.5em', background: '#fff', borderRight: '1px solid #ddd', minWidth: 300 }}>
        <h2>Paste Log</h2>
        <textarea
          value={logText}
          onChange={e => setLogText(e.target.value)}
          placeholder="Paste your game log here (1 line = 1 JSON event)"
          rows={18}
          style={{ width: 300, marginBottom: '1em', resize: 'vertical', fontFamily: 'monospace', whiteSpace: 'pre', overflowX: 'auto' }}
          wrap="off"
        />
        <button onClick={handleLoadLog} style={{ width: '100%' }}>Load Log</button>
        {error && <div style={{ color: 'red', marginTop: '1em' }}>{error}</div>}
        <div style={{ marginTop: '1em', color: '#888' }}>
          {events.length > 0 ? (
            <div>Loaded {events.length} events.</div>
          ) : (
            <div>No events loaded.</div>
          )}
        </div>
        {/* Highlighted log lines */}
        {events.length > 0 && (
          <div style={{ marginTop: '2em' }}>
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Log</div>
            <pre style={{ maxHeight: 350, overflowY: 'auto', border: '1px solid #eee', background: '#fafbfc', fontFamily: 'monospace', fontSize: 13, padding: 0, margin: 0 }}>
              {logText.split('\n').map((line, idx) => (
                <div
                  key={idx}
                  ref={el => { logLineRefs.current[idx] = el; }}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    padding: '2px 6px',
                    cursor: 'pointer',
                    background: idx === currentIndex ? '#d0eaff' : 'transparent',
                    color: idx === currentIndex ? '#003366' : '#222',
                    borderLeft: idx === currentIndex ? '3px solid #0074d9' : '3px solid transparent',
                    whiteSpace: 'pre',
                  }}
                  title={line}
                >
                  {line}
                </div>
              ))}
            </pre>
          </div>
        )}
      </div>
      {/* Center: Board */}
      <div style={{ width: 800, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ marginTop: '1em', marginBottom: 0 }}>Riichi Mahjong Log Viewer</h1>
        {events.length > 0 && (
          <Board events={events} currentIndex={currentIndex} viewedPlayer={viewedPlayer} showAllHands={showAllHands} handsRevealed={handsRevealed} />
        )}
      </div>
      {/* Right: Controls */}
      <div style={{ flex: '0 0 300px', padding: '1.5em', background: '#fff', borderLeft: '1px solid #ddd', minWidth: 300, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <h2>Controls</h2>
        {events.length > 0 && (
          <>
            <div style={{ marginBottom: '1em', width: 300 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <button style={{ flex: 1 }} onClick={goToPrev}>Prev</button>
                <button style={{ flex: 1 }} onClick={goToNext}>Next</button>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <button style={{ flex: 1 }} onClick={goToPrevPlayerTurn}>Prev Player Turn</button>
                <button style={{ flex: 1 }} onClick={goToNextPlayerTurn}>Next Player Turn</button>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ flex: 1 }} onClick={goToPrevRound}>Prev Round</button>
                <button style={{ flex: 1 }} onClick={goToNextRound}>Next Round</button>
              </div>
            </div>
            <div style={{ marginBottom: '1em' }}>
              <label htmlFor="player-select">Viewed Player: </label>
              <select
                id="player-select"
                value={viewedPlayer}
                onChange={e => setViewedPlayer(parseInt(e.target.value))}
              >
                <option value={0}>Player 0</option>
                <option value={1}>Player 1</option>
                <option value={2}>Player 2</option>
                <option value={3}>Player 3</option>
              </select>
            </div>
            <div style={{ marginBottom: '1em' }}>
              <label>
                <input
                  type="checkbox"
                  checked={showAllHands}
                  onChange={e => setShowAllHands(e.target.checked)}
                  style={{ marginRight: 6 }}
                />
                Show all hands
              </label>
            </div>
            <div>
              Event {currentIndex + 1} / {events.length}
              {viewedPlayer !== null && (
                <span> | Viewing player: {viewedPlayer}</span>
              )}
            </div>
            
            {/* Round Results - only show when on hora/ryukyoku events */}
            {roundResult && (
              <div style={{ marginTop: '2em', padding: '1em', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                <h3 style={{ margin: '0 0 0.5em 0', fontSize: '1.1em', color: '#495057' }}>Round Result</h3>
                {roundResult.type === 'hora' ? (
                  <div>
                    <div style={{ marginBottom: '0.5em' }}>
                      <strong>Winner:</strong> {roundResult.names[roundResult.actor]}
                      {roundResult.target !== roundResult.actor ? (
                        <span> (ron from {roundResult.names[roundResult.target]})</span>
                      ) : (
                        <span> (tsumo)</span>
                      )}
                    </div>
                    <div style={{ marginBottom: '0.5em' }}>
                      <strong>Score Changes:</strong>
                      <div style={{ fontSize: '0.9em', marginTop: '0.25em' }}>
                        {roundResult.deltas.map((delta: number, i: number) => (
                          <div key={i} style={{ color: delta > 0 ? '#28a745' : delta < 0 ? '#dc3545' : '#6c757d' }}>
                            {roundResult.names[i]}: {delta > 0 ? '+' : ''}{delta}
                          </div>
                        ))}
                      </div>
                    </div>
                    {roundResult.uraMarkers.length > 0 && (
                      <div style={{ marginTop: '0.5em' }}>
                        <strong>Ura-dora indicators:</strong>
                        <div style={{ marginTop: '0.25em' }}>
                          {roundResult.uraMarkers.map((marker: string, i: number) => (
                            <TileImage key={i} tile={marker} size={32} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: '0.5em' }}>
                      <strong>Draw (Ryukyoku)</strong>
                    </div>
                    <div>
                      <strong>Score Changes:</strong>
                      <div style={{ fontSize: '0.9em', marginTop: '0.25em' }}>
                        {roundResult.deltas.map((delta: number, i: number) => (
                          <div key={i} style={{ color: delta > 0 ? '#28a745' : delta < 0 ? '#dc3545' : '#6c757d' }}>
                            {roundResult.names[i]}: {delta > 0 ? '+' : ''}{delta}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App
