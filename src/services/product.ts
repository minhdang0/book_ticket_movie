// Need to use the React-specific entry point to allow generating React hooks
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

type productState = {
    data: {
        items: [
            {
                id: number,
                title: string
            }
        ]
    }
}
// Define a service using a base URL and expected endpoints
export const productApi = createApi({
    reducerPath: 'product',
    baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BASE_URL }),
    endpoints: (build) => ({
        getProductList: build.query<productState, void>({
            query: () => `/products`,
        }),

    }),
})

// Export hooks for usage in function components, which are
// auto-generated based on the defined endpoints
export const { useGetProductListQuery } = productApi