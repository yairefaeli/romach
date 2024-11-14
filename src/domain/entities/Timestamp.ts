import { isDate } from 'lodash';

export class Timestamp {
  private constructor(private readonly timestamp: Date) { }

  static now(): Timestamp {
    return new Timestamp(new Date());
  }

  static ts1970(): Timestamp {
    return new Timestamp(new Date(0));
  }

  static fromString(timestamp: string): Timestamp {
    const timestampDate = new Date(timestamp);
    if (!isDate(timestampDate)) throw new Error('Invalid timestamp');
    return new Timestamp(timestampDate);
  }

  toString(): string {
    return this.timestamp.toISOString();
  }

  toNumber(): number {
    return this.timestamp.getTime();
  }

  isAfter(timestamp: Timestamp): boolean {
    return this.timestamp > timestamp.timestamp;
  }

  subtractSeconds(seconds: number): Timestamp {
    const newTimestamp = new Date(this.timestamp);
    newTimestamp.setSeconds(newTimestamp.getSeconds() - seconds);
    return new Timestamp(newTimestamp);
  }

  subtractHours(hours: number): Timestamp {
    const newTimestamp = new Date(this.timestamp);
    newTimestamp.setHours(newTimestamp.getHours() - hours);
    return new Timestamp(newTimestamp);
  }


}
