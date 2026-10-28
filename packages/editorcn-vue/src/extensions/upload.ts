/**
 * The upload contract shared by the image and video blocks.
 *
 * Implement it however you like (OSS/COS presigned PUT, your own API, Uppy,
 * an object URL for local previews) and pass it to
 * `ImagePlaceholder.configure({ upload })` or
 * `VideoPlaceholder.configure({ upload })`.
 */
export interface UploadResult {
  /** Final URL of the uploaded file. Required. */
  src: string;
  /** Video only: poster/cover image URL. */
  poster?: string;
  /** Rendered width, e.g. `480` or `"60%"`. */
  width?: number | string;
  /** Rendered height, e.g. `"auto"`. */
  height?: number | string;
  /** Image only: alt text. */
  alt?: string;
}

export type UploadKind = "image" | "video";

export type UploadHandler = (
  file: File,
  kind: UploadKind
) => Promise<UploadResult> | UploadResult;

export const filterUploadFiles = (
  files: File[],
  {
    allowedMimeTypes,
    maxFiles,
    maxSize,
  }: {
    allowedMimeTypes?: Record<string, string[]>;
    maxFiles?: number;
    maxSize?: number;
  }
): { accepted: File[]; rejected: File[] } => {
  const accepted: File[] = [];
  const rejected: File[] = [];
  const types = Object.entries(allowedMimeTypes ?? {});

  for (const file of files) {
    const matches = types.length === 0 || types.some(([type, extensions]) => {
      const mime = type.toLowerCase();
      return (
        (mime.endsWith("/*")
          ? file.type.toLowerCase().startsWith(mime.slice(0, -1))
          : file.type.toLowerCase() === mime) ||
        extensions.some((extension) =>
          extension.startsWith(".") &&
          file.name.toLowerCase().endsWith(extension.toLowerCase())
        )
      );
    });
    if (
      matches &&
      (maxSize === undefined || file.size <= maxSize) &&
      (maxFiles === undefined || accepted.length < maxFiles)
    ) {
      accepted.push(file);
    } else {
      rejected.push(file);
    }
  }
  return { accepted, rejected };
};
