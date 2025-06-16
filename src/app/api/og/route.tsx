import { ImageResponse } from "next/og";

export const runtime = "edge";

/**
 * Generates dynamic Open Graph images for social media sharing
 *
 * @param request - The incoming request with optional query parameters
 * @returns ImageResponse with generated OG image
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get parameters from query string
    const title = searchParams.get("title")?.slice(0, 100) ?? "WheelIt";
    const subtitle =
      searchParams.get("subtitle")?.slice(0, 200) ??
      "Interactive Decision Wheel & Team Randomizer";
    const theme = searchParams.get("theme") ?? "default";

    // Define theme colors
    const themes = {
      default: {
        bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        textColor: "#ffffff",
        accentColor: "#fbbf24",
      },
      teams: {
        bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        textColor: "#ffffff",
        accentColor: "#60a5fa",
      },
      spin: {
        bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        textColor: "#ffffff",
        accentColor: "#34d399",
      },
    };

    const currentTheme = themes[theme as keyof typeof themes] || themes.default;

    return new ImageResponse(
      (
        <div
          style={{
            background: currentTheme.bg,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {/* Decorative elements */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: currentTheme.accentColor,
              opacity: 0.2,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "20px",
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              background: currentTheme.accentColor,
              opacity: 0.1,
            }}
          />

          {/* Main content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              maxWidth: "900px",
            }}
          >
            {/* Wheel icon */}
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: currentTheme.accentColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "30px",
                border: `4px solid ${currentTheme.textColor}`,
              }}
            >
              <div
                style={{
                  fontSize: "60px",
                  color: currentTheme.textColor,
                }}
              >
                🎯
              </div>
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: title.length > 20 ? "64px" : "80px",
                fontWeight: "bold",
                color: currentTheme.textColor,
                margin: "0 0 20px 0",
                lineHeight: 1.1,
                textShadow: "0 4px 8px rgba(0,0,0,0.3)",
              }}
            >
              {title}
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: "36px",
                color: currentTheme.textColor,
                margin: 0,
                opacity: 0.9,
                lineHeight: 1.3,
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              {subtitle}
            </p>
          </div>

          {/* Bottom branding */}
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              right: "40px",
              display: "flex",
              alignItems: "center",
              color: currentTheme.textColor,
              opacity: 0.8,
              fontSize: "24px",
            }}
          >
            wheelit.app
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    const errorMessage =
      e instanceof Error ? e.message : "Unknown error occurred";
    console.error("Error generating OG image:", errorMessage);
    return new Response(`Failed to generate the image: ${errorMessage}`, {
      status: 500,
    });
  }
}
