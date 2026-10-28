import { describe, expect, it } from "vitest";

import { filterUploadFiles } from "./upload";

const file = (type: string, name = "file", size = 1) =>
  new File(["x".repeat(size)], name, { type });

describe("upload file validation", () => {
  it("checks size and MIME before applying the file count limit", () => {
    const wrongType = file("video/mp4");
    const tooLarge = file("image/png", "large.png", 3);
    const first = file("image/png", "first.png");
    const extra = file("image/jpeg", "extra.jpg");

    expect(filterUploadFiles([wrongType, tooLarge, first, extra], {
      allowedMimeTypes: { "image/*": [] },
      maxSize: 2,
      maxFiles: 1,
    })).toEqual({ accepted: [first], rejected: [wrongType, tooLarge, extra] });
  });

  it("matches complete MIME types rather than regular-expression substrings", () => {
    const png = file("image/png");
    const fake = file("application/image/png");
    const jpeg = file("image/jpeg");

    expect(filterUploadFiles([png, fake, jpeg], {
      allowedMimeTypes: { "image/png": [] },
    })).toEqual({ accepted: [png], rejected: [fake, jpeg] });
  });

  it("accepts configured file extensions when the browser omits the MIME type", () => {
    const png = file("", "PHOTO.PNG");
    expect(filterUploadFiles([png], {
      allowedMimeTypes: { "image/png": [".png"] },
    }).accepted).toEqual([png]);
  });

  it("honors a zero byte or zero file limit", () => {
    const png = file("image/png");
    expect(filterUploadFiles([png], { maxSize: 0 }).accepted).toEqual([]);
    expect(filterUploadFiles([png], { maxFiles: 0 }).accepted).toEqual([]);
  });
});
