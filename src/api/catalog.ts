import type {Category, CreateCategoryRequest} from "@/@types/catalog.ts";
import type {ApiResult} from "@/@types/result.ts";
import api from "@/api/client.ts";

type MaybeApiResult<T> = T | ApiResult<T>;

function isApiResult<T>(data: MaybeApiResult<T>): data is ApiResult<T> {
    return typeof data === "object" && data !== null && "value" in data;
}

function unwrapValue<T>(data: MaybeApiResult<T>): T {
    if (isApiResult(data)) {
        return data.value;
    }

    return data;
}

export const catalogApi = {
    createCategory: async (data: CreateCategoryRequest): Promise<string> => {
        const {data: response} = await api.post<MaybeApiResult<string>>("catalog/create-category", data);
        return unwrapValue(response);
    },

    getCategories: async (): Promise<Category[]> => {
        const {data} = await api.get<MaybeApiResult<Category[]>>("catalog/get-categories-user");
        return unwrapValue(data);
    },

    getCategoryDetails: async (id: string): Promise<Category> => {
        const {data} = await api.get<Category>(`catalog/get-category/${id}`);
        return data;
    },

    deleteCategory: async (id: string): Promise<void> => {
        await api.delete(`catalog/delete-category/${id}`);
    },

    patchCategory: async (id: string, data: Partial<CreateCategoryRequest>): Promise<void> => {
        await api.patch(`catalog/patch-category/${id}`, data);
    },
};
