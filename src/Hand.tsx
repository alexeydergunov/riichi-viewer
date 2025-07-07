import React from 'react';
import { TileImage, renderMeld } from './Board';
import type { Meld } from './Board';

interface HandProps {
  hand: string[];
  melds: Meld[];
  orientation: 'top' | 'bottom' | 'left' | 'right';
  isTsumo: boolean;
}

export const Hand: React.FC<HandProps> = ({ hand, melds, orientation, isTsumo }) => {
  // Render hand tiles and melds according to orientation
  if (orientation === 'top') {
    return (
      <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
        {hand.map((t, i) => {
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
        {melds.map((m, j) => (
          <span key={j} style={{ marginRight: 8 }}>{/* right margin for melds */}
            {m && m.tiles && m.from !== undefined && m.from !== null &&
              renderMeld(m, 180)}
          </span>
        ))}
      </div>
    );
  } else if (orientation === 'bottom') {
    return (
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {hand.map((t, i) => {
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
        {melds.map((m, j) => (
          <span key={j} style={{ marginLeft: 8 }}>{/* left margin for melds */}
            {m && m.tiles && m.from !== undefined && m.from !== null &&
              renderMeld(m, 0)}
          </span>
        ))}
      </div>
    );
  } else if (orientation === 'left') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        {hand.map((t, i) => {
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          {melds.map((m, j) => (
            <span key={j} style={{ display: 'flex', flexDirection: 'column' }}>
              {m && m.tiles && m.from !== undefined && m.from !== null &&
                renderMeld(m, 90)}
            </span>
          ))}
        </div>
      </div>
    );
  } else if (orientation === 'right') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
          {melds.map((m, j) => (
            <span key={j} style={{ display: 'flex', flexDirection: 'column-reverse' }}>
              {m && m.tiles && m.from !== undefined && m.from !== null &&
                renderMeld(m, -90)}
            </span>
          ))}
        </div>
        <div style={{ height: 16 }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          {[...hand].reverse().map((t, i, arr) => {
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