import React from 'react';
import { TileImage } from './Board';
import type { Meld } from './Board';

interface MeldComponentProps {
  meld: Meld;
  orientation: number;
}

export const MeldComponent: React.FC<MeldComponentProps> = ({ meld, orientation }) => {
  // Helper to render a back tile
  const BackTile = ({ size = 32 }) => (
    <span style={{ display: 'inline-block', width: size, height: size, position: 'relative', marginRight: 2, verticalAlign: 'middle' }}>
      <img
        src={'/tiles/Back.svg'}
        alt="back"
        style={{ width: size, height: size, position: 'absolute', left: 0, top: 0, zIndex: 1, pointerEvents: 'none', userSelect: 'none' }}
        draggable={false}
      />
    </span>
  );

  if (meld.type === 'ankan' && meld.tiles.length === 4) {
    // Concealed kan: first and last are back, middle two are real
    return <>
      <span style={{ display: 'inline-block', transform: `rotate(${orientation}deg)` }}><BackTile size={32} /></span>
      <span style={{ display: 'inline-block', transform: `rotate(${orientation}deg)` }}><TileImage tile={meld.tiles[1]} size={32} /></span>
      <span style={{ display: 'inline-block', transform: `rotate(${orientation}deg)` }}><TileImage tile={meld.tiles[2]} size={32} /></span>
      <span style={{ display: 'inline-block', transform: `rotate(${orientation}deg)` }}><BackTile size={32} /></span>
    </>;
  }
  if (meld.rotatedIdx === -1) {
    return <>{meld.tiles.map((t, k) => (
      <span key={k} style={{ display: 'inline-block', transform: `rotate(${orientation}deg)` }}>
        <TileImage tile={t} size={32} />
      </span>
    ))}</>;
  }
  const tiles = meld.tiles;
  return <>{tiles.map((t, k) => {
    if (k === meld.rotatedIdx) {
      return (
        <span key={k} style={{ display: 'inline-block', transform: `rotate(${orientation + 90}deg)` }}>
          <TileImage tile={t} size={32} />
        </span>
      );
    } else {
      return (
        <span key={k} style={{ display: 'inline-block', transform: `rotate(${orientation}deg)` }}>
          <TileImage tile={t} size={32} />
        </span>
      );
    }
  })}</>;
}; 