export function getOptimizedMediaUrl(url: string, type: "image" | "video") {
  if (!url.includes("/upload/")) return url;

  if (type === "image") {
    return url.replace(
      "/upload/",
      "/upload/f_auto,q_auto,w_900/"
    );
  }

  if (type === "video") {
    return url.replace(
      "/upload/",
      "/upload/q_auto/"
    );
  }

  return url;
}