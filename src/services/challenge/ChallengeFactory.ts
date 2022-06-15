import { inject, injectable, singleton } from "microinject";
import { create as createRandom, RandomSeed } from "random-seed";

import { MAP_EXTENT_RADIUS, POTION_RADIUS } from "@/game-settings";
import { vec2Distance, Vec2Zero, Vector2 } from "@/vector2";

import { PotionBaseRegistry } from "../potion-bases/PotionBaseRegistry";
import { PotionMap } from "../potion-maps/PotionMap";

import { BrewEffectAtPointChallengeFactory } from "./challenge-types/BrewEffectAtPointChallenge";

import { IChallenge } from "./Challenge";

const CHALLENGE_MIN_RADIUS = 15;

@injectable()
@singleton()
export class ChallengeFactory {
  constructor(
    @inject(PotionBaseRegistry)
    private readonly _potionBaseRegistry: PotionBaseRegistry,
    @inject(BrewEffectAtPointChallengeFactory)
    private readonly _brewEffectAtPointChallengeFactory: BrewEffectAtPointChallengeFactory
  ) {}

  createDailyChallenge(): IChallenge {
    const todayDate = new Date().toISOString().split("T")[0];
    const random = createRandom(`daily-challenge-${todayDate}`);

    const waterMap = this._potionBaseRegistry.getPotionBaseById(
      "water" as any
    )!.map;
    const challengeMap = this._createChallengeMap(waterMap);
    const effectPosition = this._getFreeEffectPosition(
      challengeMap,
      CHALLENGE_MIN_RADIUS,
      random
    );

    const challenge = this._brewEffectAtPointChallengeFactory({
      baseMap: challengeMap,
      targetPosition: effectPosition,
    });

    return challenge;
  }

  private _createChallengeMap(base: PotionMap): PotionMap {
    return new PotionMap(
      base.entities.filter(
        (x) =>
          x.entityType !== "PotionEffect" && x.entityType !== "ExperienceBonus"
      )
    );
  }

  private _getFreeEffectPosition(
    map: PotionMap,
    minRadius: number,
    random: RandomSeed
  ): Vector2 {
    for (let i = 0; i < 50; i++) {
      // We need to extend the radius out to reach the corners, so we do not cut them out of the map.
      const radius = random.floatBetween(
        minRadius,
        vec2Distance(Vec2Zero, { x: MAP_EXTENT_RADIUS, y: MAP_EXTENT_RADIUS })
      );
      const angle = random.floatBetween(0, 2 * Math.PI);
      const p: Vector2 = {
        x: Number((radius * Math.cos(angle)).toFixed(2)),
        y: Number((radius * Math.sin(angle)).toFixed(2)),
      };

      if (
        p.x - POTION_RADIUS < -MAP_EXTENT_RADIUS ||
        p.x + POTION_RADIUS > MAP_EXTENT_RADIUS ||
        p.y - POTION_RADIUS < -MAP_EXTENT_RADIUS ||
        p.y + POTION_RADIUS > MAP_EXTENT_RADIUS
      ) {
        // Make sure its within the rectangular map.
        continue;
      }

      // Area must be free.  This means we also cant stomp on top of vortexes.
      const hit = map.hitTest(p, POTION_RADIUS);
      if (hit.length > 0) {
        continue;
      }

      return p;
    }
    throw new Error("Failed to find effect position after 50 tries");
  }
}
