// All the numbers worth tuning in playtests live here.

// Logical stage (16:9), scaled to fit the window.
export const STAGE_W = 1600;
export const STAGE_H = 900;

// Layout (stage pixels)
export const GROUND_Y = 760;        // where both stacks stand
export const TRAY_TOP = 776;        // top edge of the player's food tray
export const PLAYER_X = 400;        // center of the Turkey Team stack
export const COMPUTER_X = 1200;     // center of the Person Team house
export const BLOCK = 56;            // every piece is one block tall
export const FOOD_PIECE_W = 160;
export const HOUSE_PIECE_W = 200;
export const STACK_JITTER_PX = 8;   // pieces sit up to ±8 px off-center

// Round timing
export const ROUND_SECONDS = 10;
export const COUNTDOWN_STEP_MS = 800;   // per "3", "2", "1"
export const HURRY_SECONDS = 3;         // red timer + fast music + ticking
export const TIMES_UP_MS = 1700;        // horn + measuring tape before results
export const TIE_MESSAGE_MS = 2000;     // "It's a tie!" then restart

// Player controls
export const TRAY_SIZE = 3;
export const SNAP_ZONE_FRACTION = 0.4;  // top 40% of the player's side snaps
// Extra forgiveness: a drop anywhere above the stack itself (this many px
// either side of its center) also snaps. Set to 0 for the strict 40% zone.
export const SNAP_COLUMN_HALF = 170;

// Zoom out when the taller stack passes this share of the screen height.
export const ZOOM_START_FRACTION = 0.6;

// Computer opponent
export const DIFFICULTIES = {
  easy:   { label: 'Easy',   stars: 1, interval: 900, jitter: 200 },
  medium: { label: 'Medium', stars: 2, interval: 600, jitter: 150 },
  hard:   { label: 'Hard',   stars: 3, interval: 400, jitter: 100 },
};
export const DEFAULT_DIFFICULTY = 'easy';

// "Pause beats": the builder stops to wipe their forehead.
export const PAUSE_BEATS = {
  minCount: 1,
  maxCount: 2,
  minMs: 500,
  maxMs: 1000,
  windowStartMs: 2000,  // pauses happen between 2 s and 8 s into the round
  windowEndMs: 8000,
};
