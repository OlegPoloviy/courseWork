import { useState, useCallback } from "react";

interface SearchResult {
  items: Array<{
    title: string;
    link: string;
    displayLink: string;
    snippet: string;
    image?: {
      contextLink?: string;
      width?: number;
      height?: number;
    };
  }>;
  searchInformation: {
    formattedTotalResults: string;
    formattedSearchTime: string;
  };
  queries: {
    nextPage?: Array<{
      startIndex: number;
    }>;
  };
}

interface UseGoogleSearchReturn {
  webResults: SearchResult | null;
  imageResults: SearchResult | null;
  loading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  searchWeb: (query: string, start?: number) => Promise<void>;
  searchImages: (query: string, start?: number) => Promise<void>;
  loadMoreWeb: (query: string) => Promise<void>;
  loadMoreImages: (query: string) => Promise<void>;
  clearResults: () => void;
}

export const useGoogleSearch = (): UseGoogleSearchReturn => {
  const [webResults, setWebResults] = useState<SearchResult | null>(null);
  const [imageResults, setImageResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchWeb = useCallback(async (query: string, start: number = 1) => {
    console.log("Starting web search in hook:", { query, start });
    setLoading(true);
    setError(null);

    try {
      const searchUrl = `/api/search`;
      console.log("Making web search request to:", searchUrl);

      const response = await fetch(searchUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          start,
          searchType: "web",
        }),
      });

      console.log("Web search response status:", response.status);

      const data = await response.json();
      console.log("Web search response data:", {
        hasItems: !!data.items,
        itemCount: data.items?.length || 0,
        hasError: !!data.error,
        error: data.error,
      });

      if (!response.ok) {
        throw new Error(data.error || data.message || "Web search failed");
      }

      if (start === 1) {
        console.log("Setting initial web results");
        setWebResults(data);
      } else {
        console.log("Appending to existing web results");
        setWebResults((prev) =>
          prev
            ? {
                ...data,
                items: [...(prev.items || []), ...(data.items || [])],
              }
            : data
        );
      }
    } catch (err) {
      console.error("Web search error in hook:", {
        error: err instanceof Error ? err.message : "Unknown error",
        query,
        start,
      });
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const searchImages = useCallback(async (query: string, start: number = 1) => {
    console.log("Starting image search in hook:", { query, start });
    setLoading(true);
    setError(null);

    try {
      // For image search, we'll use the POST endpoint
      const searchUrl = `/api/search`;
      console.log("Making image search request to:", searchUrl);

      const response = await fetch(searchUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          start,
          searchType: "image",
        }),
      });

      console.log("Image search response status:", response.status);

      const data = await response.json();
      console.log("Image search response data:", {
        hasItems: !!data.items,
        itemCount: data.items?.length || 0,
        hasError: !!data.error,
        error: data.error,
      });

      if (!response.ok) {
        throw new Error(data.error || data.message || "Image search failed");
      }

      if (start === 1) {
        console.log("Setting initial image results");
        setImageResults(data);
      } else {
        console.log("Appending to existing image results");
        setImageResults((prev) =>
          prev
            ? {
                ...data,
                items: [...(prev.items || []), ...(data.items || [])],
              }
            : data
        );
      }
    } catch (err) {
      console.error("Image search error in hook:", {
        error: err instanceof Error ? err.message : "Unknown error",
        query,
        start,
      });
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Одночасний пошук веб та зображень
  const search = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ q: query }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Search failed");
      }

      if (data.web && !data.web.error) {
        setWebResults(data.web);
      }

      if (data.images && !data.images.error) {
        setImageResults(data.images);
      }

      if (data.web?.error && data.images?.error) {
        throw new Error("Both web and image searches failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMoreWeb = useCallback(
    async (query: string) => {
      if (!webResults?.queries?.nextPage) return;

      const nextStart = webResults.queries.nextPage[0]?.startIndex || 11;
      await searchWeb(query, nextStart);
    },
    [webResults, searchWeb]
  );

  const loadMoreImages = useCallback(
    async (query: string) => {
      if (!imageResults?.queries?.nextPage) return;

      const nextStart = imageResults.queries.nextPage[0]?.startIndex || 11;
      await searchImages(query, nextStart);
    },
    [imageResults, searchImages]
  );

  const clearResults = useCallback(() => {
    setWebResults(null);
    setImageResults(null);
    setError(null);
  }, []);

  return {
    webResults,
    imageResults,
    loading,
    error,
    search,
    searchWeb,
    searchImages,
    loadMoreWeb,
    loadMoreImages,
    clearResults,
  };
};
