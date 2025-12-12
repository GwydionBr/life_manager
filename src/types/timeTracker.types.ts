import { RoundingDirection } from "./settings.types";

export enum TimerState {
  Stopped = "stopped",
  Running = "running",
  Paused = "paused",
}

export type TimerRoundingSettings = {
  roundingInterval: number;
  roundingDirection: RoundingDirection;
  roundInTimeFragments: boolean;
  timeFragmentInterval: number;
};
