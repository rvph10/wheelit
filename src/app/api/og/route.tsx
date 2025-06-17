import { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * Serves the static Open Graph image for social media sharing
 *
 * @param request - The incoming request
 * @returns Redirect to the static OG image
 */
export async function GET(request: NextRequest) {
  try {
    // Redirect to the static og-image.png file in the public folder
    return Response.redirect(new URL("/og-image.png", request.url), 302);
  } catch (e: unknown) {
    const errorMessage =
      e instanceof Error ? e.message : "Unknown error occurred";
    console.error("Error serving OG image:", errorMessage);
    return new Response(`Failed to serve the image: ${errorMessage}`, {
      status: 500,
    });
  }
}
