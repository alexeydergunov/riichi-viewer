import React from 'react';
import { TileImage, tileSortKey, tileImages } from './TileImage';

// Meld type
export interface Meld {
  tiles: string[];
  calledTile: string; // The tile that was called (if any)
  from?: 'previous' | 'opposite' | 'next'; // Direction the call came from; undefined for ankan and kakan
  type: string;
  upgradeTile?: string; // For kakan, the fourth tile to overlay
}

interface MeldComponentProps {
  meld: Meld;
  orientation: number;
}

export const MeldComponent: React.FC<MeldComponentProps> = ({ meld, orientation }) => {
  // Helper to render a back tile
  const BackTile = ({ size = 32 }) => (
    <span style={{ display: 'inline-block', width: size, height: size, position: 'relative', marginRight: 2, verticalAlign: 'middle' }}>
      <img
        src={tileImages["Back"]}
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

  // Special rendering for kakan (added kan)
  if (meld.type === 'kakan' && meld.tiles.length === 2 && meld.upgradeTile) {
    let sorted = meld.tiles.slice();
    sorted.sort((a, b) => tileSortKey(a) - tileSortKey(b));
    let calledIdx = -1;
    if (meld.from === 'previous') calledIdx = 0;
    else if (meld.from === 'opposite') calledIdx = 1;
    else if (meld.from === 'next') calledIdx = 2;
    let displayTiles = [...sorted];
    displayTiles.splice(calledIdx, 0, meld.calledTile);
    // Mirror for top player
    if (orientation === 180) {
      displayTiles = displayTiles.reverse();
      calledIdx = displayTiles.length - 1 - calledIdx;
    }
    // Overlay position logic
    return (
      <div style={{ position: 'relative', display: 'flex', flexDirection: orientation === 90 || orientation === -90 ? 'column' : 'row', alignItems: 'center', overflow: 'visible' }}>
        {displayTiles.map((t, k) => {
          const isCalled = k === calledIdx;
          let overlayStyle: React.CSSProperties = {};
          if (isCalled) {
            if (orientation === 0) {
              overlayStyle = {
                position: 'absolute',
                left: '-50%',
                top: 0,
                transform: 'translateX(-50%)',
                zIndex: 3,
                pointerEvents: 'none',
              };
            } else if (orientation === 180) {
              overlayStyle = {
                position: 'absolute',
                left: '-50%',
                top: 0,
                transform: 'translateX(-50%)',
                zIndex: 3,
                pointerEvents: 'none',
              };
            } else if (orientation === 90) {
              overlayStyle = {
                position: 'absolute',
                left: -32,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 3,
                pointerEvents: 'none',
              };
            } else if (orientation === -90) {
              overlayStyle = {
                position: 'absolute',
                left: -32,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 3,
                pointerEvents: 'none',
              };
            }
          }
          return (
            <div
              key={k}
              style={{
                display: 'inline-block',
                position: 'relative',
                zIndex: isCalled ? 2 : 1,
                marginLeft: k > 0 ? 2 : 0,
                marginRight: k < displayTiles.length - 1 ? 2 : 0,
                verticalAlign: 'bottom',
                transform: `rotate(${isCalled ? orientation + 90 : orientation}deg)`
              }}
            >
              <TileImage tile={t} size={32} />
              {isCalled && (
                <span style={overlayStyle}>
                  <TileImage tile={meld.upgradeTile!} size={32} />
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // For open melds, sort tiles before inserting called tile
  let displayTiles: string[] = [];
  let calledIdx = -1;
  // Sort order: ascending for bottom/right, descending for top/left
  let sorted = [...meld.tiles];
  sorted.sort((a, b) => tileSortKey(a) - tileSortKey(b));
  if (meld.from === 'previous') calledIdx = 0;
  else if (meld.from === 'opposite') calledIdx = 1;
  else if (meld.from === 'next') calledIdx = sorted.length;
  displayTiles = [...sorted];
  displayTiles.splice(calledIdx, 0, meld.calledTile);
  // Mirror chi melds for top player
  if (orientation === 180) {
    displayTiles = displayTiles.reverse();
    calledIdx = displayTiles.length - 1 - calledIdx;
  }
  //console.log(meld.from, meld.tiles, displayTiles);

  return <>{displayTiles.map((t, k) => {
    if (k === calledIdx && meld.from) {
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