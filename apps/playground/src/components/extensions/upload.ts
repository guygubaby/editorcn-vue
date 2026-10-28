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
