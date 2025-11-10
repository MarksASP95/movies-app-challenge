export class ObjectUtils {
  static buildRecord<T>(data: T[], indexKey: keyof T): Record<string, T> {
    const record: Record<string, T> = {};
    for (const element of data) {
      record[element[indexKey] as any] = element;
    }
    return record;
  }
}
