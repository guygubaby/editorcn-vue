# 图片 / 视频上传

上传逻辑完全由你实现。组件只负责挑文件、调用你的函数、把返回值插进文档。

## UploadHandler

```ts
import type { UploadHandler } from "@/components/extensions";

const upload: UploadHandler = async (file, kind) => {
  // kind: "image" | "video"
  const res = await fetch("/api/upload-url", { method: "POST" });
  const { url } = await res.json();

  await fetch(url, { method: "PUT", body: file });

  return { src: url.split("?")[0] };
};
```

签名：

```ts
type UploadKind = "image" | "video";

interface UploadResult {
  src: string;          // 必填，最终地址
  poster?: string;      // 视频封面
  width?: number | string;
  height?: number;
  alt?: string;         // 图片 alt
}

type UploadHandler = (
  file: File,
  kind: UploadKind
) => Promise<UploadResult> | UploadResult;
```

## 接到三个地方

```ts
import {
  ImagePlaceholder,
  MediaUpload,
  Video,
  VideoPlaceholder,
} from "@/components/extensions";

const editor = useEditor({
  extensions: [
    StarterKit.configure({ gapcursor: false }),
    // 图片占位块：点选 / 拖入文件 → upload → 替换为图片节点
    ImagePlaceholder.configure({ upload }),
    // 视频占位块
    Video,
    VideoPlaceholder.configure({ upload }),
    // 直接粘贴或拖放图片/视频到编辑器任意位置
    MediaUpload.configure({ upload, maxSize: 20 * 1024 * 1024 }),
  ],
});
```

`MediaUpload` 不会凭空创建节点：只有编辑器里注册了 `image`（`ResizableImage`）与 `video` 时才会插入对应内容。

## 行为约定

| 场景 | 结果 |
| --- | --- |
| 没有传 `upload` 给 `ImagePlaceholder` | 回退为 base64 data URL，大图会撑爆文档，仅适合演示 |
| 没有传 `upload` 给 `VideoPlaceholder` | 显示错误，不插入 |
| 一次选择多张图片 | 并行上传，按原顺序插入 |
| 上传失败 | 占位块保留，块内显示错误，可重试 |
| 传入 URL 而不是文件 | 直接使用，不经过 `upload` |
| 超过 `maxSize` | 拒绝并触发 `onError` / `onDropRejected` |

占位块的文件选择器和拖放入口都会检查 `allowedMimeTypes`、`maxSize` 和 `maxFiles`。超出限制的文件会传给 `onDropRejected`，不会上传；上传中不会重复发起同一占位块的上传。

`MediaUpload` 会保留最初的粘贴或拖放位置，并随文档编辑更新位置，不会覆盖后来选中的其他文字。上传期间替换文档、删除目标位置或销毁编辑器后，不再插入上传结果。

## 视频选项

`Video` 节点属性（可在 `insertVideo` 时传入，也可以在 node view 里改）：

| 属性 | 默认 | 说明 |
| --- | --- | --- |
| `src` | `null` | 视频地址 |
| `poster` | `null` | 封面图 |
| `width` | `"100%"` | 数字或 CSS 值 |
| `height` | `null` | 可选固定高度 |
| `objectFit` | `"cover"` | `contain` / `cover` / `fill` / `none` / `scale-down` |
| `align` | `"center"` | `left` / `center` / `right` |
| `autoplay` | `false` | |
| `loop` | `false` | |
| `muted` | `false` | |
| `controls` | `true` | |
| `playsInline` | `true` | iOS 内联播放 |
| `preload` | `"metadata"` | |

```ts
editor.chain().focus().insertVideo({
  src: "https://cdn.example.com/a.mp4",
  poster: "https://cdn.example.com/a.jpg",
  objectFit: "contain",
  align: "left",
  autoplay: true,
  muted: true,
}).run();
```

## 图片选项

`ResizableImage` 在 Tiptap `Image` 基础上增加：

| 属性 | 默认 | 说明 |
| --- | --- | --- |
| `width` | `"60%"` | 数字或百分比 |
| `align` | `"center"` | `left` / `center` / `right` |
| `objectFit` | 未设置 | 与视频相同 |
| `alt` | — | |

节点视图支持拖拽缩放、对齐、复制、删除。

## 建议

- 大文件走对象存储直传（OSS / COS / S3 预签名 URL），不要把文件代理进业务服务器。
- `upload` 里做鉴权和类型校验；组件侧的 `maxSize` 只是体验优化，不是安全边界。
- 失败时抛出 Error，占位块会把 `message` 展示给用户。
