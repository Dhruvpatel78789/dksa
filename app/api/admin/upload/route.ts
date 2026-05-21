import cloudinary from "@/lib/cloudinary";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(req: Request) {
  try {
    const token = (await cookies()).get("token")?.value;

if (!token) {
  return Response.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}

const decoded: any = verifyToken(token);

if (decoded.role !== "admin") {
  return Response.json(
    { error: "Forbidden" },
    { status: 403 }
  );
}
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      return Response.json(
        { error: "Only image or video files are allowed" },
        { status: 400 }
      );
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return Response.json(
        { error: "Image must be under 5MB" },
        { status: 400 }
      );
    }

    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      return Response.json(
        { error: "Video must be under 50MB" },
        { status: 400 }
      );
    }

    const safeFolder =
      folder === "reviews" || folder === "products" || folder === "ingredients"
        ? folder
        : "general";

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "auto",
            folder: `medtech/${safeFolder}`,
            transformation: isImage
              ? [{ quality: "auto", fetch_format: "auto" }]
              : undefined,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    return Response.json({
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}