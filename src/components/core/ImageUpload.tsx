import { useState } from "react";
import { Upload, message, Image, Button, Spin, Progress } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
} from "@ant-design/icons";
import type { UploadProps } from "antd";
import { mediaApi } from "@/apis/media";

interface ImageUploadProps {
  value?: Array<{ url: string; isPrimary?: boolean; alt?: string }>;
  onChange?: (
    images: Array<{ url: string; isPrimary?: boolean; alt?: string }>,
  ) => void;
  maxCount?: number;
  folder?: string;
}

export default function ImageUpload({
  value = [],
  onChange,
  maxCount = 10,
  folder = "products",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  // Upload multiple files at once
  const handleUploadMultiple = async (files: File[]) => {
    if (files.length === 0) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      // Upload all files at once
      const response = await mediaApi.uploadFiles(files, { folder });

      // Map response to image format
      const newImages = response.data.map((media, index) => ({
        url: media.url,
        isPrimary: value.length === 0 && index === 0, // First image is primary if no existing images
        alt: media.filename,
      }));

      onChange?.([...value, ...newImages]);
      message.success(`${files.length} ảnh đã được tải lên thành công`);
      setUploadProgress(100);
    } catch (error: any) {
      message.error(
        `Tải lên thất bại: ${error.response?.data?.message || error.message}`,
      );
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleRemove = (index: number) => {
    const newImages = value.filter((_, i) => i !== index);
    // If removed primary image, set first image as primary
    if (value[index].isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true;
    }
    onChange?.(newImages);
  };

  const handleSetPrimary = (index: number) => {
    const newImages = value.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onChange?.(newImages);
  };

  const uploadProps: UploadProps = {
    beforeUpload: (file, fileList) => {
      // Just collect files, don't upload yet
      return false; // Prevent default upload behavior
    },
    onChange: (info) => {
      // Handle file selection
      const files = info.fileList
        .map((f) => f.originFileObj)
        .filter(Boolean) as File[];

      if (files.length === 0) return;

      const remainingSlots = maxCount - value.length;

      if (files.length > remainingSlots) {
        message.warning(`Chỉ có thể tải lên tối đa ${remainingSlots} ảnh nữa`);
        const limitedFiles = files.slice(0, remainingSlots);
        handleUploadMultiple(limitedFiles);
      } else {
        handleUploadMultiple(files);
      }
    },
    showUploadList: false,
    accept: "image/*",
    multiple: true,
    fileList: [], // Clear file list after each selection
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {value.map((image, index) => (
          <div key={index} className="relative group">
            <Image
              src={image.url}
              alt={image.alt || `Product image ${index + 1}`}
              className="rounded-lg object-cover w-full h-32"
              preview={false}
              onClick={() => {
                setPreviewImage(image.url);
                setPreviewOpen(true);
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <Button
                type="primary"
                size="small"
                icon={image.isPrimary ? <StarFilled /> : <StarOutlined />}
                onClick={() => handleSetPrimary(index)}
                ghost={!image.isPrimary}
              >
                {image.isPrimary ? "Primary" : "Set Primary"}
              </Button>
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleRemove(index)}
              >
                Xóa
              </Button>
            </div>
            {image.isPrimary && (
              <div className="absolute top-2 right-2">
                <StarFilled className="text-yellow-400 text-xl" />
              </div>
            )}
          </div>
        ))}

        {value.length < maxCount && (
          <Upload {...uploadProps} disabled={uploading}>
            <div className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
              {uploading ? (
                <div className="w-full px-4">
                  <Spin />
                  <div className="text-sm text-gray-500 mt-2">
                    Đang tải lên...
                  </div>
                  {uploadProgress > 0 && (
                    <Progress percent={uploadProgress} size="small" />
                  )}
                </div>
              ) : (
                <>
                  <PlusOutlined className="text-2xl text-gray-400 mb-2" />
                  <div className="text-sm text-gray-500">Chọn ảnh</div>
                  <div className="text-xs text-gray-400 mt-1">
                    (Chọn nhiều ảnh)
                  </div>
                </>
              )}
            </div>
          </Upload>
        )}
      </div>

      {value.length > 0 && (
        <div className="text-sm text-gray-500">
          {value.length} / {maxCount} ảnh
          {value.find((img) => img.isPrimary) && (
            <span className="ml-2">
              • Ảnh có <StarFilled className="text-yellow-400" /> sẽ là ảnh
              chính
            </span>
          )}
        </div>
      )}

      {/* Image Preview Modal */}
      <Image
        preview={{
          visible: previewOpen,
          onVisibleChange: setPreviewOpen,
          src: previewImage,
        }}
        style={{ display: "none" }}
      />
    </div>
  );
}
