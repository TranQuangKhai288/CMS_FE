import React from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  type FormItemProps,
  type InputProps,
  type InputNumberProps,
  type SelectProps,
  type SwitchProps,
} from "antd";

// --- TYPE DEFINITIONS ---

// Props chung cho tất cả Form Item (Label, Name, Rules...)
interface BaseFieldProps extends Omit<FormItemProps, "children"> {
  label?: string;
  name: string | string[]; // Support nested name ['user', 'name']
  placeholder?: string;
  disabled?: boolean;
}

// --- 1. CORE INPUT (Text, Email, Password...) ---
interface CoreInputProps
  extends BaseFieldProps, Omit<InputProps, "placeholder" | "name" | "onReset"> {
  type?: "text" | "password" | "email";
}

export const CoreInput: React.FC<CoreInputProps> = ({
  label,
  name,
  rules,
  placeholder,
  disabled,
  type = "text",
  ...rest // Các props còn lại của Form.Item
}) => {
  return (
    <Form.Item label={label} name={name} rules={rules} {...rest}>
      {type === "password" ? (
        <Input.Password placeholder={placeholder} disabled={disabled} />
      ) : (
        <Input type={type} placeholder={placeholder} disabled={disabled} />
      )}
    </Form.Item>
  );
};

// --- 2. CORE TEXTAREA ---
interface CoreTextAreaProps extends BaseFieldProps {
  rows?: number;
  maxLength?: number;
  showCount?: boolean;
}

export const CoreTextArea: React.FC<CoreTextAreaProps> = ({
  label,
  name,
  rules,
  placeholder,
  rows = 4,
  disabled,
  maxLength,
  showCount,
  ...rest
}) => {
  return (
    <Form.Item label={label} name={name} rules={rules} {...rest}>
      <Input.TextArea
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        maxLength={maxLength}
        showCount={showCount}
      />
    </Form.Item>
  );
};

// --- 3. CORE INPUT NUMBER (Hỗ trợ tiền tệ tự động) ---
interface CoreInputCurrencyProps
  extends
    BaseFieldProps,
    Omit<InputNumberProps, "placeholder" | "name" | "onReset"> {
  isCurrency?: boolean; // Nếu true sẽ tự format tiền tệ
  min?: number;
  max?: number;
  addonAfter?: React.ReactNode;
  inputProps?: InputNumberProps;
}

export const CoreInputCurrency: React.FC<CoreInputCurrencyProps> = ({
  label,
  name,
  rules,
  placeholder,
  disabled,
  isCurrency = false,
  min = 0,
  max,
  addonAfter,
  className,
  inputProps,
  ...rest // Các props của Form.Item
}) => {
  // 1. Formatter: Hiển thị (Number -> String có dấu phẩy)
  const currencyFormatter = (value: number | string | undefined) => {
    if (value === undefined || value === null || value === "") return "";
    return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // 2. Parser: Nhập liệu (String có dấu phẩy -> Number)
  const currencyParser = (displayValue: string | undefined) => {
    if (!displayValue) return 0; // Hoặc undefined nếu muốn cho phép null

    // Chỉ giữ lại số, dấu chấm và dấu trừ. Xóa dấu phẩy và các ký tự lạ.
    const cleanValue = displayValue.replace(/,/g, "");

    // Ép kiểu về Number ngay lập tức
    const numberValue = Number(cleanValue);

    return isNaN(numberValue) ? 0 : numberValue;
  };

  return (
    <Form.Item
      label={label}
      name={name}
      rules={rules}
      // 3. CHỐT CHẶN CUỐI CÙNG: normalize
      // Đảm bảo dù InputNumber có trả về string thì Form vẫn nhận được Number
      normalize={(value) => {
        if (!value) return 0;
        return Number(value);
      }}
      {...rest}
    >
      <InputNumber
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full ${className}`}
        min={min}
        max={max}
        addonAfter={addonAfter}
        formatter={isCurrency ? currencyFormatter : undefined}
        parser={isCurrency ? currencyParser : undefined}
        // Thêm các props khác của InputNumber
        {...inputProps}
      />
    </Form.Item>
  );
};

// --- 4. CORE SELECT ---
interface CoreSelectProps
  extends BaseFieldProps, Omit<SelectProps, "placeholder" | "name"> {
  options: { label: string; value: any }[];
  mode?: "multiple" | "tags";
}

export const CoreSelect: React.FC<CoreSelectProps> = ({
  label,
  name,
  rules,
  placeholder,
  disabled,
  options,
  loading,
  mode,
  showSearch = true, // Mặc định cho phép search
  ...rest
}) => {
  return (
    <Form.Item label={label} name={name} rules={rules} {...rest}>
      <Select
        placeholder={placeholder}
        disabled={disabled}
        options={options}
        loading={loading}
        mode={mode}
        showSearch={showSearch}
        // Filter search không phân biệt hoa thường
        filterOption={(input, option) =>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
        }
      />
    </Form.Item>
  );
};

// --- 5. CORE SWITCH ---
interface CoreSwitchProps extends BaseFieldProps, Omit<SwitchProps, "name"> {
  checkedChildren?: string;
  unCheckedChildren?: string;
}

export const CoreSwitch: React.FC<CoreSwitchProps> = ({
  label,
  name,
  disabled,
  checkedChildren,
  unCheckedChildren,
  ...rest
}) => {
  return (
    // Switch cần valuePropName="checked" để hoạt động với Form
    <Form.Item
      label={label}
      name={name}
      valuePropName="checked"
      {...rest}
      className="mb-0"
    >
      <Switch
        disabled={disabled}
        checkedChildren={checkedChildren}
        unCheckedChildren={unCheckedChildren}
      />
    </Form.Item>
  );
};
