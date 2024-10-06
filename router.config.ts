// This variable is used to store all routes of the project
export const LINKS = {
  HOME: "/" as const,
  DASHBOARD: "/dashboard" as const,
  BLOG: "/dashboard/blog" as const,
};

// This variable is used to store all API Paths in the project
export const PATHS = {
  BLOG: {
    LIST: ({
      searchText,
      state = "published",
      limit,
      order,
      page,
      sort,
      tags,
    }: {
      searchText?: string;
      page?: number;
      limit?: number;
      sort?: string;
      order?: string;
      tags?: string;
      state?: string;
    }) => {
      return {
        root: `/api/blog/list?state=${state}${
          searchText ? `&searchText=${searchText}` : ""
        }${limit ? `&limit=${limit}` : ""}${order ? `&order=${order}` : ""}${
          page ? `&page=${page}` : ""
        }${sort ? `&sort=${sort}` : ""}${tags ? `&tags=${tags}` : ""}` as const,
      };
    },
    CREATE_UPDATE: () => {
      return { root: `/api/blog/upsert` as const };
    },
    DELETE: (id: number) => {
      return { root: `/api/blog/delete?id=${id}` as const };
    },
  } as const,
};

// This variable is used to store all TanStack Query Keys in this project
export const QUERY_KEYS = {
  BLOG: {
    LIST: ({
      searchText,
      state = "published",
      limit,
      order,
      page,
      sort,
      tags,
    }: {
      searchText?: string;
      page?: number;
      limit?: number;
      sort?: string;
      order?: string;
      tags?: string;
      state?: string;
    }) => {
      return {
        key: `blog-list-${searchText}-${page}-${limit}-${sort}-${order}-${tags}-${state}` as const,
      };
    },
  } as const,
} as const;
