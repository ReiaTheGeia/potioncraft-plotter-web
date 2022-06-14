import { ContainerModule } from "microinject";

import {
  BrewEffectAtPointChallengeFactory,
  brewEffectAtPointChallengeFactoryFactory,
} from "./challenge-types/BrewEffectAtPointChallenge";

import { ChallengeFactory } from "./ChallengeFactory";

export default new ContainerModule((bind) => {
  bind(BrewEffectAtPointChallengeFactory)
    .toFactory(brewEffectAtPointChallengeFactoryFactory)
    .inSingletonScope();
  bind(ChallengeFactory);
});
