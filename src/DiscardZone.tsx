import React from 'react';
import { TileImage } from './TileImage';

export interface DiscardTile {
  tile: string;
  isRiichi?: boolean;
  isTsumogiri?: boolean;
  isCalled?: boolean;
}

interface DiscardZoneProps {
  tiles: DiscardTile[];
  orientation: 'top' | 'bottom' | 'left' | 'right';
}

// Renders a 6x4 discard zone for a player, with correct orientation and riichi tile rotation
export const DiscardZone: React.FC<DiscardZoneProps> = ({ tiles, orientation }) => {
  // Helper to get tile transform based on orientation and riichi
  function getTransform(isRiichi: boolean) {
    switch (orientation) {
      case 'top': return `rotate(${180 + (isRiichi ? 90 : 0)}deg)`;
      case 'bottom': return isRiichi ? 'rotate(90deg)' : undefined;
      case 'left': return `rotate(${90 + (isRiichi ? 90 : 0)}deg)`;
      case 'right': return `rotate(${-90 + (isRiichi ? 90 : 0)}deg)`;
      default: return undefined;
    }
  }

  // Layout: 6x4 grid, but order and flex direction depend on orientation
  let rows: React.ReactNode[] = [];
  if (orientation === 'top' || orientation === 'bottom') {
    for (let row = 0; row < 4; row++) {
      const slice = tiles.slice(
        orientation === 'top' ? (3 - row) * 6 : row * 6,
        orientation === 'top' ? (3 - row) * 6 + 6 : row * 6 + 6
      );
      const tilesRow = (orientation === 'top' ? slice.slice(0).reverse() : slice).map((d, i) => (
        <span key={i} style={{ display: 'inline-block', transform: getTransform(!!d.isRiichi), opacity: (d as any).isTsumogiri ? 0.6 : 1, filter: (d as any).isCalled ? 'brightness(0.5)' : undefined }}>
          <TileImage tile={d.tile} size={32} />
        </span>
      ));
      rows.push(
        <div key={row} style={{ display: 'flex', flexDirection: 'row', justifyContent: orientation === 'top' ? 'flex-end' : 'flex-start', height: 32, marginBottom: row < 3 ? 4 : 0 }}>
          {tilesRow}
        </div>
      );
    }
  } else {
    // left/right: columns of 6, 4 columns
    let colOrder: number[] = [];
    if (orientation === 'left') {
      colOrder = [3, 2, 1, 0];
    } else if (orientation === 'right') {
      colOrder = [0, 1, 2, 3]; // reverse order for right
    }
    for (let i = 0; i < 4; i++) {
      const col = orientation === 'left' ? colOrder[i] : colOrder[3 - i];
      rows.push(
        <div key={col} style={{ display: 'flex', flexDirection: 'column', justifyContent: orientation === 'left' ? 'flex-start' : 'flex-end', width: 32, height: 192, marginRight: orientation === 'left' && i < 3 ? 4 : undefined, marginLeft: orientation === 'right' && i < 3 ? 4 : undefined }}>
          {Array.from({ length: 6 }).map((_, row) => {
            const idx = orientation === 'left' ? col * 6 + row : (3 - col) * 6 + (5 - row);
            const d = tiles[idx];
            return d ? (
              <span key={row} style={{ display: 'inline-block', transform: getTransform(!!d.isRiichi), opacity: (d as any).isTsumogiri ? 0.6 : 1, filter: (d as any).isCalled ? 'brightness(0.5)' : undefined }}>
                <TileImage tile={d.tile} size={32} />
              </span>
            ) : null;
          })}
        </div>
      );
    }
  }
  return (
    <div style={{ display: orientation === 'top' || orientation === 'bottom' ? 'flex' : 'flex', flexDirection: orientation === 'top' || orientation === 'bottom' ? 'column' : 'row', width: orientation === 'top' || orientation === 'bottom' ? 192 : 128, height: orientation === 'top' || orientation === 'bottom' ? 128 : 192 }}>
      {rows}
    </div>
  );
}; 