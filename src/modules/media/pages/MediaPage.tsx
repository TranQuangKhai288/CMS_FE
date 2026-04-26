import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Row,
  Col,
  Input,
  Button,
  Upload,
  Image,
  Typography,
  Space,
  Tag,
  Empty,
  Spin,
  message,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  CloudUploadOutlined,
  DeleteOutlined,
  SearchOutlined,
  FileImageOutlined,
  CopyOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { mediaApi, type Media } from "@/apis/media";

const { Title, Text } = Typography;
const { Search } = Input;

export default function MediaPage() {
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [pageSize] = useState(24);
  
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["media", page, searchText, pageSize],
    queryFn: () => mediaApi.getMedia({ page, pageSize, search: searchText }),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => mediaApi.uploadFile(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      message.success("Tải lên thành công!");
    },
    onError: () => {
      message.error("Tải lên thất bại!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mediaApi.deleteMedia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      message.success("Đã xóa file!");
    },
    onError: () => {
      message.error("Xóa thất bại!");
    },
  });

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPage(1);
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    message.success("Đã copy link ảnh!");
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleUpload = (info: any) => {
    const { status, originFileObj } = info.file;
    if (status !== 'uploading' && originFileObj) {
      uploadMutation.mutate(originFileObj);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <Title level={3} className="mb-0!">
            Thư viện Media
          </Title>
          <Upload
            showUploadList={false}
            customRequest={({ file }: any) => uploadMutation.mutate(file)}
            accept="image/*"
          >
            <Button
              type="primary"
              icon={<CloudUploadOutlined />}
              size="large"
              loading={uploadMutation.isPending}
              className="bg-indigo-600!"
            >
              Tải lên hình ảnh
            </Button>
          </Upload>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Search
            placeholder="Tìm kiếm theo tên file..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            className="max-w-md"
          />
          <div className="flex items-center text-gray-400 text-sm">
            Tổng số: <Text strong className="ml-1">{data?.pagination?.total || 0}</Text> files
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" tip="Đang tải thư viện..." />
          </div>
        ) : isError ? (
          <Empty description="Không thể tải dữ liệu media" />
        ) : data?.data?.length === 0 ? (
          <Empty description="Thư viện trống" />
        ) : (
          <Row gutter={[16, 16]}>
            {data?.data?.map((item: Media) => (
              <Col xs={12} sm={8} md={6} lg={4} key={item.id}>
                <Card
                  hoverable
                  className="group overflow-hidden border-gray-100!"
                  bodyStyle={{ padding: 12 }}
                  cover={
                    <div className="relative h-40 bg-gray-50 flex items-center justify-center overflow-hidden">
                      <Image
                        src={item.url}
                        alt={item.alt || item.filename}
                        className="object-contain transition-transform group-hover:scale-105"
                        fallback="/placeholder-image.png"
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Popconfirm
                          title="Xóa vĩnh viễn file này?"
                          onConfirm={() => deleteMutation.mutate(item.id)}
                          okText="Xóa"
                          cancelText="Hủy"
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            type="primary"
                            danger
                            shape="circle"
                            size="small"
                            icon={<DeleteOutlined />}
                          />
                        </Popconfirm>
                      </div>
                    </div>
                  }
                >
                  <div className="space-y-2">
                    <Text
                      strong
                      ellipsis
                      className="block text-sm"
                      title={item.filename}
                    >
                      {item.filename}
                    </Text>
                    <div className="flex justify-between items-center">
                      <Tag className="m-0! text-[10px]">{formatSize(item.size)}</Tag>
                      <Space size={4}>
                        <Tooltip title="Copy URL">
                          <Button
                            type="text"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => copyUrl(item.url)}
                            className="text-indigo-500!"
                          />
                        </Tooltip>
                        <Tooltip title="Tải về">
                          <a href={item.url} download target="_blank" rel="noreferrer">
                            <Button
                              type="text"
                              size="small"
                              icon={<DownloadOutlined />}
                            />
                          </a>
                        </Tooltip>
                      </Space>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>
    </div>
  );
}
