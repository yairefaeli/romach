import { RealityId } from '../../../application/entities/reality-id';

export interface RequestContextData {
    realityId: RealityId;
}

export class RequestContext {
    private requestContextData: RequestContextData;

    get realityId(): RealityId {
        return this.requestContextData.realityId;
    }

    set realityId(realityId: RealityId) {
        this.requestContextData.realityId = realityId;
    }
}
