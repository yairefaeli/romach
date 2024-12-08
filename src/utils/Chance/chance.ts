import { RealityId } from '../../application/entities/reality-id';
import { Chance } from 'chance';

export const chance = new Chance() as Chance.Chance & { upn: () => string; realityId: () => RealityId };

chance.mixin({
    upn: () => `s${chance.string({ length: 7, alpha: false, numeric: true })}@idf.il`,
    realityId: () => chance.pickone(['1', ['2'], ['3']]),
});
