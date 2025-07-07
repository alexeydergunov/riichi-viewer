import React from 'react';

// Map log tile string to image file name
export function tileToImage(tile: string): string | null {
  // Suited: 1m-9m, 1p-9p, 1s-9s, 5pr, 5sr
  if (/^[1-9]m$/.test(tile)) return `Man${tile[0]}.svg`;
  if (/^[1-9]p$/.test(tile)) return `Pin${tile[0]}.svg`;
  if (/^[1-9]s$/.test(tile)) return `Sou${tile[0]}.svg`;
  if (tile === '5pr') return 'Pin5-Dora.svg';
  if (tile === '5sr') return 'Sou5-Dora.svg';
  if (tile === '5mr') return 'Man5-Dora.svg';
  // Honors
  if (tile === 'E') return 'Ton.svg';
  if (tile === 'S') return 'Nan.svg';
  if (tile === 'W') return 'Shaa.svg';
  if (tile === 'N') return 'Pei.svg';
  if (tile === 'P') return 'Haku.svg';
  if (tile === 'F') return 'Hatsu.svg';
  if (tile === 'C') return 'Chun.svg';
  // Fallback
  return null;
}

export const TileImage: React.FC<{ tile: string; size?: number }> = ({ tile, size = 32 }) => {
  const img = tileToImage(tile);
  if (img) {
    return (
      <span style={{
        display: 'inline-block',
        width: size,
        height: size,
        position: 'relative',
        marginRight: 2,
        verticalAlign: 'middle',
      }}>
        <img
          src={'/tiles/Front.svg'}
          alt="front"
          style={{
            width: size,
            height: size,
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: 0,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
          draggable={false}
        />
        <img
          src={`/tiles/${img}`}
          alt={tile}
          title={tile}
          style={{
            width: size,
            height: size,
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: 1,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
          onError={e => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
          draggable={false}
        />
      </span>
    );
  } else {
    return <span style={{ display: 'inline-block', width: size, height: size, lineHeight: `${size}px`, textAlign: 'center', border: '1px solid #ccc', marginRight: 2 }}>{tile}</span>;
  }
};

// Tile sort order: manzu 1-9, pinzu 1-9, souzu 1-9, E, S, W, N, P (White), F (Green), C (Red)
export function tileSortKey(tile: string): number {
  // Manzu
  if (/^[1-9]m$/.test(tile)) return parseInt(tile[0], 10) - 1;
  // Pinzu
  if (/^[1-9]p$/.test(tile)) return 9 + parseInt(tile[0], 10) - 1;
  // Souzu
  if (/^[1-9]s$/.test(tile)) return 18 + parseInt(tile[0], 10) - 1;
  // Honors
  if (tile === 'E') return 27;
  if (tile === 'S') return 28;
  if (tile === 'W') return 29;
  if (tile === 'N') return 30;
  if (tile === 'P') return 31; // White
  if (tile === 'F') return 32; // Green
  if (tile === 'C') return 33; // Red
  // Aka-dora (red fives)
  if (tile === '5mr') return 4; // after 5m
  if (tile === '5pr') return 13; // after 5p
  if (tile === '5sr') return 22; // after 5s
  return 100; // fallback
} 