export interface ApiResult<T> {
    value: T;
    isSuccess: boolean;
    error?: unknown;
}