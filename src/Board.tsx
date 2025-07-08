import React from 'react';
import { DiscardZone } from './DiscardZone';
import { Hand } from './Hand';
import { RoundInfo } from './RoundInfo';
import { tileSortKey } from './TileImage';
import type { Meld } from './Meld';

interface BoardProps {
  events: any[];
  currentIndex: number;
  viewedPlayer?: number | null;
  showAllHands?: boolean;
  handsRevealed?: boolean[];
}

interface DiscardTile {
  tile: string;
  isRiichi?: boolean;
  isTsumogiri?: boolean;
  isCalled?: boolean;
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

function sortHandExceptLast(hand: string[]): string[] {
  if (hand.length <= 1) return hand.slice();
  const sorted = hand.slice(0, hand.length - 1).sort((a, b) => tileSortKey(a) - tileSortKey(b));
  sorted.push(hand[hand.length - 1]);
  return sorted;
}

export const Board: React.FC<BoardProps> = ({ events, currentIndex, viewedPlayer = 0, showAllHands = false, handsRevealed }) => {
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
        players[e.actor].discards.push({ tile: e.pai, isRiichi, isTsumogiri: !!e.tsumogiri });
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
        if (e.type === 'kakan') {
          // Find the existing pon meld and add the fourth tile
          const melds = players[e.actor].melds;
          const ponIdx = melds.findIndex(m => (m.type === 'pon' || m.type === 'kakan') && m.tiles.includes(e.pai));
          if (ponIdx !== -1) {
            melds[ponIdx].type = 'kakan';
            melds[ponIdx].upgradeTile = e.pai; // Add upgradeTile property
          }
          // Remove the tile from hand
          if (e.consumed) {
            e.consumed.forEach((tile: string) => {
              const idx = players[e.actor].hand.indexOf(tile);
              if (idx !== -1) players[e.actor].hand.splice(idx, 1);
            });
          }
          players[e.actor].hand.sort((a, b) => tileSortKey(a) - tileSortKey(b));
          break;
        }
        let meld: Meld;
        if (e.type === 'chi' || e.type === 'pon' || e.type === 'daiminkan') {
          let from: 'previous' | 'opposite' | 'next' | undefined = undefined;
          if (typeof e.target === 'number') {
            const rel = (e.target - e.actor + 4) % 4;
            if (rel === 1) from = 'next';
            else if (rel === 2) from = 'opposite';
            else if (rel === 3) from = 'previous';
          }
          let tiles: string[] = [];
          let calledTile = '';
          if (e.consumed) {
            tiles = e.consumed.slice(); // Only non-called tiles
            calledTile = e.pai;
          } else {
            tiles = [];
            calledTile = e.pai;
          }
          meld = {
            tiles,
            calledTile,
            from,
            type: e.type,
          };
        } else {
          // ankan
          meld = {
            tiles: e.consumed ? e.consumed.slice() : [],
            calledTile: e.pai,
            from: undefined,
            type: e.type,
          };
        }
        players[e.actor].melds.push(meld);
        if (e.consumed) {
          e.consumed.forEach((tile: string) => {
            const idx = players[e.actor].hand.indexOf(tile);
            if (idx !== -1) players[e.actor].hand.splice(idx, 1);
          });
        }
        // Mark the called tile in the discards of the player who discarded it
        if (typeof e.target === 'number') {
          const targetPlayer = e.target;
          for (let i = players[targetPlayer].discards.length - 1; i >= 0; i--) {
            const d = players[targetPlayer].discards[i];
            if (d.tile === e.pai && !d.isCalled) {
              d.isCalled = true;
              break;
            }
          }
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

  // Find the most recent start_kyoku event at or before currentIndex
  let kyotaku = 0;
  let honbaCount = 0;
  for (let i = currentIndex; i >= 0; i--) {
    const e = events[i];
    if (e.type === 'start_kyoku') {
      kyotaku = e.kyotaku ?? 0;
      honbaCount = e.honba ?? 0;
      break;
    }
  }

  // Rotate players so that viewedPlayer is always at the bottom
  const rotate = (arr: any[], n: number) => arr.slice(n).concat(arr.slice(0, n));
  const vp = viewedPlayer ?? 0;
  const rotatedPlayers = rotate(players, vp);
  const rotatedNames = rotate(names, vp);
  const rotatedScores = rotate(scores, vp);

  // Compute dealer's index in rotated arrays
  const dealerIndex = (dealer - vp + 4) % 4;

  // Discards for each player
  const discards = rotatedPlayers.map(p => p.discards);

  // Helper to determine if a player should have the tsumo gap for the current event
  function isTsumoForPlayer(playerIdx: number) {
    const event = events[currentIndex];
    // If tsumo event and actor matches
    if (event?.type === 'tsumo' && event.actor === playerIdx) return true;
    // If hora event and actor==target (self-draw/tsumo)
    if (event?.type === 'hora' && event.actor === playerIdx && event.actor === event.target) return true;
    // If end_kyoku, look back for hora event
    if (event?.type === 'end_kyoku') {
      for (let i = currentIndex - 1; i >= 0; i--) {
        const prev = events[i];
        if (prev.type === 'hora' && prev.actor === playerIdx && prev.actor === prev.target) {
          return true;
        }
        if (prev.type === 'hora' || prev.type === 'ryukyoku') break;
      }
    }
    return false;
  }

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
            isTsumo={isTsumoForPlayer(((viewedPlayer ?? 0) + 2) % 4)}
            closed={!(handsRevealed ? handsRevealed[(2 + vp) % 4] : showAllHands)}
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
            isTsumo={isTsumoForPlayer((viewedPlayer ?? 0))}
            closed={!(handsRevealed ? handsRevealed[(0 + vp) % 4] : true)}
          />
        </div>
      </div>
      {/* Left player */}
      <div style={{ gridRow: 2, gridColumn: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', height: '100%' }}>
        <Hand
          hand={rotatedPlayers[3].hand}
          melds={rotatedPlayers[3].melds}
          orientation="left"
          isTsumo={isTsumoForPlayer(((viewedPlayer ?? 0) + 3) % 4)}
          closed={!(handsRevealed ? handsRevealed[(3 + vp) % 4] : showAllHands)}
        />
      </div>
      {/* Right player */}
      <div style={{ gridRow: 2, gridColumn: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', height: '100%', maxHeight: '100%', overflow: 'visible' }}>
        <Hand
          hand={rotatedPlayers[1].hand}
          melds={rotatedPlayers[1].melds}
          orientation="right"
          isTsumo={isTsumoForPlayer(((viewedPlayer ?? 0) + 1) % 4)}
          closed={!(handsRevealed ? handsRevealed[(1 + vp) % 4] : showAllHands)}
        />
      </div>
      {/* Center: Discards */}
      <RoundInfo
        round={round}
        dealer={dealerIndex}
        riichi={kyotaku}
        honba={honbaCount}
        doraMarkers={doraMarkers}
        playerNames={rotatedNames}
        playerScores={rotatedScores}
      />
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