import React from 'react';
import { TileImage, tileImages } from './TileImage';
import type { Meld } from './Meld';
import { MeldComponent } from './Meld';

interface HandProps {
  hand: string[];
  melds: Meld[];
  orientation: 'top' | 'bottom' | 'left' | 'right';
  isTsumo: boolean;
  closed?: boolean;
}

export const Hand: React.FC<HandProps> = ({ hand, melds, orientation, isTsumo, closed }) => {
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

  if (orientation === 'top') {
    return (
      <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
        {closed
          ? hand.map((_, i) => {
              const isLast = i === hand.length - 1 && hand.length > 1 && isTsumo;
              return (
                <React.Fragment key={i}>
                  {isLast && <span style={{ display: 'inline-block', width: 8 }} />}
                  <BackTile size={32} />
                </React.Fragment>
              );
            })
          : hand.map((t, i) => {
              const isLast = i === hand.length - 1 && hand.length > 1 && isTsumo;
              return (
                <React.Fragment key={i}>
                  {isLast && <span style={{ display: 'inline-block', width: 8 }} />}
                  <span style={{ display: 'inline-block', transform: 'rotate(180deg)' }}>
                    <TileImage tile={t} size={32} />
                  </span>
                </React.Fragment>
              );
            })}
        <div style={{ width: 16 }} />
        <div style={{ overflow: 'visible', display: 'flex' }}>
          {melds.slice().reverse().map((m, j) => (
            <span key={j} style={{ marginRight: 8 }}>{/* right margin for melds */}
              {m && m.tiles && <MeldComponent meld={m} orientation={180} />}
            </span>
          ))}
        </div>
      </div>
    );
  } else if (orientation === 'bottom') {
    return (
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {closed
          ? hand.map((_, i) => {
              const isLast = i === hand.length - 1 && hand.length > 1 && isTsumo;
              return (
                <React.Fragment key={i}>
                  {isLast && <span style={{ display: 'inline-block', width: 8 }} />}
                  <BackTile size={32} />
                </React.Fragment>
              );
            })
          : hand.map((t, i) => {
              const isLast = i === hand.length - 1 && hand.length > 1 && isTsumo;
              return (
                <React.Fragment key={i}>
                  {isLast && <span style={{ display: 'inline-block', width: 8 }} />}
                  <span style={{ display: 'inline-block' }}>
                    <TileImage tile={t} size={32} />
                  </span>
                </React.Fragment>
              );
            })}
        <div style={{ width: 16 }} />
        <div style={{ overflow: 'visible', display: 'flex' }}>
          {melds.slice().reverse().map((m, j) => (
            <span key={j} style={{ marginLeft: 8 }}>{/* left margin for melds */}
              {m && m.tiles && <MeldComponent meld={m} orientation={0} />}
            </span>
          ))}
        </div>
      </div>
    );
  } else if (orientation === 'left') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        {closed
          ? hand.map((_, i) => {
              const isLast = i === hand.length - 1 && hand.length > 1 && isTsumo;
              return (
                <React.Fragment key={i}>
                  {isLast && <span style={{ display: 'block', height: 8 }} />}
                  <span style={{ display: 'inline-block', transform: 'rotate(90deg)' }}>
                    <BackTile size={32} />
                  </span>
                </React.Fragment>
              );
            })
          : hand.map((t, i) => {
              const isLast = i === hand.length - 1 && hand.length > 1 && isTsumo;
              return (
                <React.Fragment key={i}>
                  {isLast && <span style={{ display: 'block', height: 8 }} />}
                  <span style={{ display: 'inline-block', transform: 'rotate(90deg)' }}>
                    <TileImage tile={t} size={32} />
                  </span>
                </React.Fragment>
              );
            })}
        <div style={{ height: 16 }} />
        <div style={{ overflow: 'visible', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          {melds.slice().reverse().map((m, j) => (
            <span key={j} style={{ display: 'flex', flexDirection: 'column' }}>
              {m && m.tiles && <MeldComponent meld={m} orientation={90} />}
            </span>
          ))}
        </div>
      </div>
    );
  } else if (orientation === 'right') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <div style={{ overflow: 'visible', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
          {melds.slice().reverse().map((m, j) => (
            <span key={j} style={{ display: 'flex', flexDirection: 'column-reverse' }}>
              {m && m.tiles && <MeldComponent meld={{ ...m, tiles: [...m.tiles].reverse() }} orientation={-90} />}
            </span>
          ))}
        </div>
        <div style={{ height: 16 }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          {closed
            ? [...hand].reverse().map((_, i, arr) => {
                const isLast = i === 0 && arr.length > 1 && isTsumo;
                return (
                  <React.Fragment key={i}>
                    <span style={{ display: 'inline-block', transform: 'rotate(-90deg)' }}>
                      <BackTile size={32} />
                    </span>
                    {isLast && <span style={{ display: 'block', height: 8 }} />}
                  </React.Fragment>
                );
              })
            : [...hand].reverse().map((t, i, arr) => {
                if (i === 0 && arr.length > 1 && isTsumo) {
                  return (
                    <React.Fragment key={i}>
                      <span style={{ display: 'inline-block', transform: 'rotate(-90deg)' }}>
                        <TileImage tile={t} size={32} />
                      </span>
                      <span style={{ display: 'block', height: 8 }} />
                    </React.Fragment>
                  );
                } else {
                  return (
                    <span key={i} style={{ display: 'inline-block', transform: 'rotate(-90deg)' }}>
                      <TileImage tile={t} size={32} />
                    </span>
                  );
                }
              })}
        </div>
      </div>
    );
  } else {
    return null;
  }
}; 