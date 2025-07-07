import React from 'react';

// Map log tile string to image file name
export function tileToImage(tile: string): string | null {
  // Suited: 1m-9m, 1p-9p, 1s-9s, 5pr, 5sr
  if (/^[1-9]m$/.test(tile)) return `Man${tile[0]}`;
  if (/^[1-9]p$/.test(tile)) return `Pin${tile[0]}`;
  if (/^[1-9]s$/.test(tile)) return `Sou${tile[0]}`;
  if (tile === '5pr') return 'Pin5-Dora';
  if (tile === '5sr') return 'Sou5-Dora';
  if (tile === '5mr') return 'Man5-Dora';
  // Honors
  if (tile === 'E') return 'Ton';
  if (tile === 'S') return 'Nan';
  if (tile === 'W') return 'Shaa';
  if (tile === 'N') return 'Pei';
  if (tile === 'P') return 'Haku';
  if (tile === 'F') return 'Hatsu';
  if (tile === 'C') return 'Chun';
  // Fallback
  return null;
}

// Create tileImages object with all tile images
export const tileImages: Record<string, string> = {
  // Basic tiles
  'Front': '/tiles/Front.svg',
  'Back': '/tiles/Back.svg',
  'Blank': '/tiles/Blank.svg',
  
  // Manzu (characters)
  'Man1': '/tiles/Man1.svg',
  'Man2': '/tiles/Man2.svg',
  'Man3': '/tiles/Man3.svg',
  'Man4': '/tiles/Man4.svg',
  'Man5': '/tiles/Man5.svg',
  'Man5-Dora': '/tiles/Man5-Dora.svg',
  'Man6': '/tiles/Man6.svg',
  'Man7': '/tiles/Man7.svg',
  'Man8': '/tiles/Man8.svg',
  'Man9': '/tiles/Man9.svg',
  
  // Pinzu (dots)
  'Pin1': '/tiles/Pin1.svg',
  'Pin2': '/tiles/Pin2.svg',
  'Pin3': '/tiles/Pin3.svg',
  'Pin4': '/tiles/Pin4.svg',
  'Pin5': '/tiles/Pin5.svg',
  'Pin5-Dora': '/tiles/Pin5-Dora.svg',
  'Pin6': '/tiles/Pin6.svg',
  'Pin7': '/tiles/Pin7.svg',
  'Pin8': '/tiles/Pin8.svg',
  'Pin9': '/tiles/Pin9.svg',
  
  // Souzu (bamboo)
  'Sou1': '/tiles/Sou1.svg',
  'Sou2': '/tiles/Sou2.svg',
  'Sou3': '/tiles/Sou3.svg',
  'Sou4': '/tiles/Sou4.svg',
  'Sou5': '/tiles/Sou5.svg',
  'Sou5-Dora': '/tiles/Sou5-Dora.svg',
  'Sou6': '/tiles/Sou6.svg',
  'Sou7': '/tiles/Sou7.svg',
  'Sou8': '/tiles/Sou8.svg',
  'Sou9': '/tiles/Sou9.svg',
  
  // Honors
  'Ton': '/tiles/Ton.svg',
  'Nan': '/tiles/Nan.svg',
  'Shaa': '/tiles/Shaa.svg',
  'Pei': '/tiles/Pei.svg',
  'Haku': '/tiles/Haku.svg',
  'Hatsu': '/tiles/Hatsu.svg',
  'Chun': '/tiles/Chun.svg',
};

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
          src={tileImages["Front"]}
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
          src={tileImages[img]}
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