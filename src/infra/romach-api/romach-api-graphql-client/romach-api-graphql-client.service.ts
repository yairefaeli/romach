import { RomachApiJwtIssuerService } from '../romach-api-jwt-issuer/romach-api-jwt-issuer.service';
import { RequestContext } from '../../http/request-context/request-context';
import { GraphQLClient } from 'graphql-request';
import fetch, { RequestInit } from 'node-fetch';
import { Agent as HttpsAgent } from 'https';
import { Agent as HttpAgent } from 'http';

export class RomachApiGraphqlClientService {
    private client: GraphQLClient;

    constructor(
        private url: string,
        private timeout: number,
        private requestContext: RequestContext,
        private romachJwtService: RomachApiJwtIssuerService,
    ) {
        const enhancedFetch: any = async (_url: any, options?: RequestInit) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);
            options.signal = controller.signal;

            options.agent =
                new URL(this.url).protocol === 'https:'
                    ? new HttpsAgent({ timeout: this.timeout, rejectUnauthorized: false })
                    : new HttpAgent({ timeout: this.timeout });

            try {
                const response = await fetch(_url, options);
                clearTimeout(timeoutId);
                return response;
            } catch (error) {
                if (error.name === 'AbortError') {
                    throw new Error('Request timed out');
                }
                throw error;
            }
        };

        this.client = new GraphQLClient(url, {
            fetch: enhancedFetch,
            headers: { 'reality-id': this.requestContext.realityId },
        });
    }

    async query<T>(query: string, variables?: any): Promise<T> {
        const token = await this.romachJwtService.getToken();
        if (!token) {
            throw new Error('No API token');
        }
        this.client.setHeader('Authorization', `Bearer ${token}`);
        return this.client.request<T>(query, variables);
    }
}
