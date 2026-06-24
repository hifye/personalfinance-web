export const CatalogType = {
    None: 0,
    Income: 1,
    Expense: 2,
} as const;

export type CatalogType = typeof CatalogType[keyof typeof CatalogType];

export interface Category {
    id: string;
    name: string;
    type: CatalogType;
    userId: string;
    createdAt: string;
}

export interface CreateCategoryRequest {
    name: string;
    type: CatalogType;
}
