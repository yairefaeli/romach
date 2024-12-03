import { Chance } from 'chance';

export const chance = new Chance() as Chance.Chance & { upn: () => string };

chance.mixin({
    upn: () => `s${chance.string({ length: 7, alpha: false, numeric: true })}@idf.il`,
});
