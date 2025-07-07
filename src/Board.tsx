import React from 'react';
import { DiscardZone } from './DiscardZone';
import { Hand } from './Hand';

interface BoardProps {
  events: any[];
  currentIndex: number;
  viewedPlayer?: number | null;
}

interface DiscardTile {
  tile: string;
  isRiichi?: boolean;
}

// Meld type
export interface Meld {
  tiles: string[];
  calledTile: string;
  from: 'previous' | 'opposite' | 'next' | null;
}

interface PlayerState {
  hand: string[];
  discards: DiscardTile[];
  melds: Meld[];
  score: number;
  name: string;
}

const initialPlayerState = (name = ''): PlayerState => ({
  hand: [],
  discards: [],
  melds: [],
  score: 25000,
  name,
});

// Map log tile string to image file name
function tileToImage(tile: string): string | null {
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

const winds = ['East', 'South', 'West', 'North'];

// Tile sort order: manzu 1-9, pinzu 1-9, souzu 1-9, E, S, W, N, P (White), F (Green), C (Red)
function tileSortKey(tile: string): number {
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

function sortHandExceptLast(hand: string[]): string[] {
  if (hand.length <= 1) return hand.slice();
  const sorted = hand.slice(0, hand.length - 1).sort((a, b) => tileSortKey(a) - tileSortKey(b));
  sorted.push(hand[hand.length - 1]);
  return sorted;
}

export const Board: React.FC<BoardProps> = ({ events, currentIndex, viewedPlayer = 0 }) => {
  // Initialize state for 4 players
  const players: PlayerState[] = [0, 1, 2, 3].map(() => initialPlayerState());
  let doraMarkers: string[] = [];
  let round = '';
  let dealer = 0;
  let scores = [25000, 25000, 25000, 25000];
  let names = ['0', '1', '2', '3'];
  // Track pending riichi for each player
  const pendingRiichi: boolean[] = [false, false, false, false];

  // Replay events up to currentIndex
  for (let i = 0; i <= currentIndex && i < events.length; i++) {
    const e = events[i];
    switch (e.type) {
      case 'start_game':
        if (e.names) names = e.names;
        break;
      case 'start_kyoku':
        round = `${e.bakaze}${e.kyoku}`;
        dealer = e.oya;
        scores = e.scores;
        doraMarkers = [e.dora_marker];
        for (let p = 0; p < 4; p++) {
          players[p] = initialPlayerState(names[p]);
          players[p].hand = e.tehais[p] ? e.tehais[p].slice() : [];
          players[p].hand.sort((a, b) => tileSortKey(a) - tileSortKey(b));
          players[p].score = e.scores[p];
          pendingRiichi[p] = false;
        }
        break;
      case 'dora':
        doraMarkers.push(e.dora_marker);
        break;
      case 'tsumo':
        players[e.actor].hand.push(e.pai);
        players[e.actor].hand = sortHandExceptLast(players[e.actor].hand);
        break;
      case 'reach':
        pendingRiichi[e.actor] = true;
        break;
      case 'dahai': {
        const isRiichi = pendingRiichi[e.actor] === true;
        players[e.actor].discards.push({ tile: e.pai, isRiichi });
        pendingRiichi[e.actor] = false;
        // Remove from hand (if present)
        const idx = players[e.actor].hand.indexOf(e.pai);
        if (idx !== -1) players[e.actor].hand.splice(idx, 1);
        players[e.actor].hand.sort((a, b) => tileSortKey(a) - tileSortKey(b));
        break;
      }
      // Melds (chi, pon, kan)
      case 'chi':
      case 'pon':
      case 'daiminkan':
      case 'kakan':
      case 'ankan': {
        let meld: Meld;
        if (e.type === 'chi' || e.type === 'pon' || e.type === 'daiminkan') {
          let from: 'previous' | 'opposite' | 'next' | null = null;
          if (typeof e.target === 'number') {
            const rel = (e.target - e.actor + 4) % 4;
            if (rel === 1) from = 'previous';
            else if (rel === 2) from = 'opposite';
            else if (rel === 3) from = 'next';
          }
          let tiles: string[] = [];
          if (e.consumed) {
            if (from === 'previous') {
              tiles = e.consumed.slice();
              tiles.push(e.pai);
            } else if (from === 'next') {
              tiles = [e.pai, ...e.consumed];
            } else if (from === 'opposite') {
              const mid = Math.floor(e.consumed.length / 2);
              tiles = e.consumed.slice(0, mid);
              tiles.push(e.pai);
              tiles = tiles.concat(e.consumed.slice(mid));
            } else {
              tiles = e.consumed.concat([e.pai]); // fallback
            }
          } else {
            tiles = [e.pai];
          }
          meld = {
            tiles,
            calledTile: e.pai,
            from,
          };
        } else {
          meld = {
            tiles: e.consumed ? e.consumed.slice() : [],
            calledTile: '',
            from: null,
          };
        }
        players[e.actor].melds.push(meld);
        if (e.consumed) {
          e.consumed.forEach((tile: string) => {
            const idx = players[e.actor].hand.indexOf(tile);
            if (idx !== -1) players[e.actor].hand.splice(idx, 1);
          });
        }
        players[e.actor].hand.sort((a, b) => tileSortKey(a) - tileSortKey(b));
        break;
      }
      case 'hora':
      case 'ryukyoku':
        if (e.deltas) {
          for (let p = 0; p < 4; p++) {
            players[p].score += e.deltas[p];
          }
        }
        break;
      default:
        break;
    }
  }

  // Rotate players so that viewedPlayer is always at the bottom
  const rotate = (arr: any[], n: number) => arr.slice(n).concat(arr.slice(0, n));
  const vp = viewedPlayer ?? 0;
  const rotatedPlayers = rotate(players, vp);
  const rotatedNames = rotate(names, vp);
  const rotatedScores = rotate(scores, vp);
  const rotatedWinds = rotate(winds, vp);

  // Discards for each player
  const discards = rotatedPlayers.map(p => p.discards);

  // Table layout: grid
  return (
    <div style={{
      width: 800,
      height: 800,
      margin: '0 auto',
      display: 'grid',
      gridTemplateRows: '80px 1fr 80px',
      gridTemplateColumns: '80px 1fr 80px',
      background: '#2e7d3b',
      borderRadius: 24,
      boxShadow: '0 2px 16px #0003',
      position: 'relative',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      {/* Top player */}
      <div style={{ gridRow: 1, gridColumn: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 2 }}>
          <Hand
            hand={rotatedPlayers[2].hand}
            melds={rotatedPlayers[2].melds}
            orientation="top"
            isTsumo={events[currentIndex]?.type === 'tsumo' && events[currentIndex]?.actor === ((viewedPlayer ?? 0) + 2) % 4}
          />
        </div>
      </div>
      {/* Bottom player (viewed) */}
      <div style={{ gridRow: 3, gridColumn: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', height: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 2 }}>
          <Hand
            hand={rotatedPlayers[0].hand}
            melds={rotatedPlayers[0].melds}
            orientation="bottom"
            isTsumo={events[currentIndex]?.type === 'tsumo' && events[currentIndex]?.actor === (viewedPlayer ?? 0)}
          />
        </div>
      </div>
      {/* Left player */}
      <div style={{ gridRow: 2, gridColumn: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', height: '100%' }}>
        <Hand
          hand={rotatedPlayers[3].hand}
          melds={rotatedPlayers[3].melds}
          orientation="left"
          isTsumo={events[currentIndex]?.type === 'tsumo' && events[currentIndex]?.actor === ((viewedPlayer ?? 0) + 3) % 4}
        />
      </div>
      {/* Right player */}
      <div style={{ gridRow: 2, gridColumn: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', height: '100%', maxHeight: '100%', overflow: 'hidden' }}>
        <Hand
          hand={rotatedPlayers[1].hand}
          melds={rotatedPlayers[1].melds}
          orientation="right"
          isTsumo={events[currentIndex]?.type === 'tsumo' && events[currentIndex]?.actor === ((viewedPlayer ?? 0) + 1) % 4}
        />
      </div>
      {/* Center: Discards */}
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
        <div style={{ position: 'absolute', left: '50%', top: 24, transform: 'translate(-50%, 0)', textAlign: 'center', color: '#fff', fontWeight: 'bold', fontSize: 15, textShadow: '0 0 4px #000', pointerEvents: 'none', zIndex: 2 }}>
          {rotatedNames[2]}<br /><span style={{ fontWeight: 'normal', fontSize: 13 }}>Score: {rotatedScores[2]}</span>
        </div>
        <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translate(0, -50%) rotate(-90deg)', textAlign: 'left', color: '#fff', fontWeight: 'bold', fontSize: 15, textShadow: '0 0 4px #000', pointerEvents: 'none', zIndex: 2 }}>
          {rotatedNames[1]}<br /><span style={{ fontWeight: 'normal', fontSize: 13 }}>Score: {rotatedScores[1]}</span>
        </div>
        <div style={{ position: 'absolute', left: '50%', bottom: 24, transform: 'translate(-50%, 0)', textAlign: 'center', color: '#fff', fontWeight: 'bold', fontSize: 15, textShadow: '0 0 4px #000', pointerEvents: 'none', zIndex: 2 }}>
          {rotatedNames[0]}<br /><span style={{ fontWeight: 'normal', fontSize: 13 }}>Score: {rotatedScores[0]}</span>
        </div>
        <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translate(0, -50%) rotate(90deg)', textAlign: 'right', color: '#fff', fontWeight: 'bold', fontSize: 15, textShadow: '0 0 4px #000', pointerEvents: 'none', zIndex: 2 }}>
          {rotatedNames[3]}<br /><span style={{ fontWeight: 'normal', fontSize: 13 }}>Score: {rotatedScores[3]}</span>
        </div>
        {/* Center info: round, dealer, riichi, honba, dora */}
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: '#fff', fontWeight: 'bold', fontSize: 16, zIndex: 3 }}>
          <div>Round: {round} | Dealer: {dealer}</div>
          <div>Riichi: {events.filter(e => e.type === 'reach').length} | Honba: {events.filter(e => e.type === 'honba').length}</div>
          <div style={{ marginTop: 4, color: '#fff', fontSize: 13, fontWeight: 'normal' }}>
            Dora: {doraMarkers.map((d: string, i: number) => <TileImage key={i} tile={d} size={32} />)}
          </div>
        </div>
      </div>
      {/* Discard zones */}
      {/* Top player discards */}
      <div style={{ position: 'absolute', left: '50%', bottom: 'calc(50% + 136px)', transform: 'translate(-50%, 0)', zIndex: 1 }}>
        <DiscardZone tiles={discards[2]} orientation="top" />
      </div>
      {/* Bottom player discards */}
      <div style={{ position: 'absolute', left: '50%', top: 'calc(50% + 136px)', transform: 'translate(-50%, 0)', zIndex: 1 }}>
        <DiscardZone tiles={discards[0]} orientation="bottom" />
      </div>
      {/* Left player discards */}
      <div style={{ position: 'absolute', right: 'calc(50% + 136px)', top: '50%', transform: 'translate(0, -50%)', zIndex: 1 }}>
        <DiscardZone tiles={discards[3]} orientation="left" />
      </div>
      {/* Right player discards */}
      <div style={{ position: 'absolute', left: 'calc(50% + 136px)', top: '50%', transform: 'translate(0, -50%)', zIndex: 1 }}>
        <DiscardZone tiles={discards[1]} orientation="right" />
      </div>
    </div>
  );
};

export function renderMeld(m: Meld, orientation: number) {
  if (!m.calledTile || !m.from) {
    return m.tiles.map((t, k) => (
      <span key={k} style={{ display: 'inline-block', transform: `rotate(${orientation}deg)` }}>
        <TileImage tile={t} size={32} />
      </span>
    ));
  }
  const tiles = m.tiles;
  let calledIdx = 0;
  if (m.from === 'previous') calledIdx = 0;
  else if (m.from === 'opposite') calledIdx = Math.floor(tiles.length / 2);
  else if (m.from === 'next') calledIdx = tiles.length - 1;
  return tiles.map((t, k) => {
    if (k === calledIdx) {
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
  });
} 