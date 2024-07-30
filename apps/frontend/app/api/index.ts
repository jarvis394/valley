import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_URL } from '../config/constants'

export const apiSlice = createApi({
  reducerPath: 'api',
  tagTypes: [],
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  endpoints: (builder) => ({
    upload: builder.mutation({
      query: (body) => ({
        url: '/upload',
        method: 'post',
        body,
        formData: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    }),
  }),
})

export const { useUploadMutation } = apiSlice
