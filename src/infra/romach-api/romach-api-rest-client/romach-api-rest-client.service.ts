import axios, { AxiosInstance } from 'axios';
import { Agent as HttpsAgent } from 'https';
import { Agent as HttpAgent } from 'http';
import ms from 'ms';

const DEFAULT_HTTP_TIMEOUT = ms('30s');
export class RomachApiRestClientService<T, R> {
    private client: AxiosInstance;

    constructor(
        private url: string,
        private timeout: number = DEFAULT_HTTP_TIMEOUT,
    ) {
        const isHttps = new URL(this.url).protocol === 'https:';
        const httpAgent = !isHttps ? new HttpAgent({ timeout: this.timeout }) : undefined;
        const httpsAgent = isHttps ? new HttpsAgent({ timeout: this.timeout, rejectUnauthorized: false }) : undefined;

        this.client = axios.create({
            timeout: this.timeout,
            httpAgent,
            httpsAgent,
        });
    }

    public async post(body: T): Promise<R> {
        return (await this.client.post<R>(this.url, body)).data;
    }
}
