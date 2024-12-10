import { Chance } from 'chance';

export const chance = Chance.Chance();

chance.mixin({
    upn: () => `s${chance.string({ length: 7, alpha: false, numeric: true })}@idf.il`,
    realityId: () => chance.pickone(['1', ['2'], ['3']]),
});
