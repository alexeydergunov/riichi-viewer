import React from 'react';
import { TileImage } from './Board';

interface RoundInfoProps {
  round: string;
  dealer: number;
  riichi: number;
  honba: number;
  doraMarkers: string[];
  playerNames: string[];
  playerScores: number[];
}

export const RoundInfo: React.FC<RoundInfoProps> = ({ round, dealer, riichi, honba, doraMarkers, playerNames, playerScores }) => (
  <div style={{
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 240,
    height: 240,
    transform: 'translate(-50%, -50%)',
    background: '#388e3c33',
    borderRadius: 16,
    boxShadow: '0 0 8px #0002',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  }}>
    {/* Player names and scores, positioned symmetrically */}
    <div style={{ position: 'absolute', left: '50%', bottom: 8, transform: 'translate(-50%, 0)', textAlign: 'center', color: '#fff', fontWeight: 'bold', fontSize: 15, textShadow: '0 0 4px #000', pointerEvents: 'none', zIndex: 2, whiteSpace: 'nowrap' }}>
      {dealer === 0 ? (
        <span style={{ color: 'red' }}>{playerNames[0]} <span style={{ fontWeight: 'normal', fontSize: 13, color: 'red' }}>({playerScores[0]})</span></span>
      ) : (
        <>{playerNames[0]} <span style={{ fontWeight: 'normal', fontSize: 13 }}>({playerScores[0]})</span></>
      )}
    </div>
    <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translate(0, -50%) rotate(-90deg)', textAlign: 'left', color: '#fff', fontWeight: 'bold', fontSize: 15, textShadow: '0 0 4px #000', pointerEvents: 'none', zIndex: 2, whiteSpace: 'nowrap' }}>
      {dealer === 1 ? (
        <span style={{ color: 'red' }}>{playerNames[1]} <span style={{ fontWeight: 'normal', fontSize: 13, color: 'red' }}>({playerScores[1]})</span></span>
      ) : (
        <>{playerNames[1]} <span style={{ fontWeight: 'normal', fontSize: 13 }}>({playerScores[1]})</span></>
      )}
    </div>
    <div style={{ position: 'absolute', left: '50%', top: 8, transform: 'translate(-50%, 0)', textAlign: 'center', color: '#fff', fontWeight: 'bold', fontSize: 15, textShadow: '0 0 4px #000', pointerEvents: 'none', zIndex: 2, whiteSpace: 'nowrap' }}>
      {dealer === 2 ? (
        <span style={{ color: 'red' }}>{playerNames[2]} <span style={{ fontWeight: 'normal', fontSize: 13, color: 'red' }}>({playerScores[2]})</span></span>
      ) : (
        <>{playerNames[2]} <span style={{ fontWeight: 'normal', fontSize: 13 }}>({playerScores[2]})</span></>
      )}
    </div>
    <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translate(0, -50%) rotate(90deg)', textAlign: 'right', color: '#fff', fontWeight: 'bold', fontSize: 15, textShadow: '0 0 4px #000', pointerEvents: 'none', zIndex: 2, whiteSpace: 'nowrap' }}>
      {dealer === 3 ? (
        <span style={{ color: 'red' }}>{playerNames[3]} <span style={{ fontWeight: 'normal', fontSize: 13, color: 'red' }}>({playerScores[3]})</span></span>
      ) : (
        <>{playerNames[3]} <span style={{ fontWeight: 'normal', fontSize: 13 }}>({playerScores[3]})</span></>
      )}
    </div>
    {/* Center info: round, riichi, honba, dora */}
    <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: '#fff', fontWeight: 'bold', fontSize: 16, zIndex: 3 }}>
      <div>Round: {round}</div>
      <div>Riichi: {riichi} | Honba: {honba}</div>
      <div style={{ marginTop: 4, color: '#fff', fontSize: 13, fontWeight: 'normal' }}>
        Dora: {doraMarkers.map((d: string, i: number) => <TileImage key={i} tile={d} size={32} />)}
      </div>
    </div>
  </div>
); 