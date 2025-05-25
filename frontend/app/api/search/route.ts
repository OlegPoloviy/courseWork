import { NextResponse } from "next/server";

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${
        process.env.GOOGLE_API_KEY
      }&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(
        query
      )}`
    );

    if (!response.ok) {
      throw new Error("Search request failed");
    }

    const data: SearchResult = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  console.log("Starting POST request handling...");

  try {
    const contentType = request.headers.get("content-type") || "";
    console.log("Request content type:", contentType);

    if (contentType.includes("multipart/form-data")) {
      // Handle image file upload
      console.log("Processing image file upload...");
      const formData = await request.formData();
      const image = formData.get("image") as File;

      if (!image) {
        console.error("No image file provided in request");
        return NextResponse.json(
          { error: "Image file is required" },
          { status: 400 }
        );
      }

      console.log("Image received:", {
        name: image.name,
        type: image.type,
        size: image.size,
      });

      // Convert image to base64
      const buffer = await image.arrayBuffer();
      const base64Image = Buffer.from(buffer).toString("base64");
      console.log("Image converted to base64, length:", base64Image.length);

      // Call Google Vision API for image search
      console.log("Calling Google Vision API...");
      const visionApiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_API_KEY}`;
      console.log("Vision API URL:", visionApiUrl);

      const response = await fetch(visionApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Image,
              },
              features: [
                {
                  type: "LABEL_DETECTION",
                  maxResults: 10,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Vision API error response:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        throw new Error(`Vision API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Vision API response received:", {
        hasLabels: !!data.responses?.[0]?.labelAnnotations,
        labelCount: data.responses?.[0]?.labelAnnotations?.length || 0,
      });

      return NextResponse.json(data);
    } else {
      // Handle text-based search (web or image)
      console.log("Processing text-based search...");
      const body = await request.json();
      const { query, start = 1, searchType = "web" } = body;

      if (!query) {
        console.error("No query provided in request");
        return NextResponse.json(
          { error: "Query parameter is required" },
          { status: 400 }
        );
      }

      console.log("Search parameters:", { query, start, searchType });

      // Construct the search URL based on search type
      const searchUrl = new URL("https://www.googleapis.com/customsearch/v1");
      searchUrl.searchParams.append("key", process.env.GOOGLE_API_KEY || "");
      searchUrl.searchParams.append(
        "cx",
        process.env.GOOGLE_SEARCH_ENGINE_ID || ""
      );
      searchUrl.searchParams.append("q", query);
      searchUrl.searchParams.append("start", start.toString());

      if (searchType === "image") {
        searchUrl.searchParams.append("searchType", "image");
      }

      console.log("Making request to Google Search API:", searchUrl.toString());

      const response = await fetch(searchUrl.toString());

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Google Search API error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        throw new Error(`Search request failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Search API response received:", {
        hasItems: !!data.items,
        itemCount: data.items?.length || 0,
        searchType,
      });

      return NextResponse.json(data);
    }
  } catch (error: unknown) {
    console.error("Request error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: "Failed to perform search",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
