import { NextRequest, NextResponse } from "next/server";

// Hàm tạo màu ngẫu nhiên dựa trên chuỗi
const stringToColor = (string: string) => {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
};

// Route API để tạo avatar
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name") || "User";

    // Lấy kích thước từ query params hoặc mặc định là 128
    const size = parseInt(searchParams.get("size") || "128", 10);

    // Xác định text hiển thị (2 chữ cái đầu tiên của tên)
    const initials = name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

    // Tạo màu dựa trên tên
    const backgroundColor = stringToColor(name);

    // Tạo SVG
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="100%" height="100%" fill="${backgroundColor}" />
      <text 
        x="50%" 
        y="50%" 
        dy=".1em" 
        fill="white" 
        font-family="Arial, sans-serif" 
        font-size="${size / 2.5}px" 
        text-anchor="middle" 
        dominant-baseline="middle"
      >
        ${initials}
      </text>
    </svg>
    `;

    // Trả về SVG dưới dạng image
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error generating avatar:", error);
    return NextResponse.json(
      { error: "Failed to generate avatar" },
      { status: 500 },
    );
  }
}
