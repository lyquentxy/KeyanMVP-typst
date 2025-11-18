/**
 * Ant Design 组件统一导入工具
 * Tree-shaking优化导入，实现最佳Bundle Size
 * 使用ES Module单独导入，避免全量引入
 */

// 基础组件
export { default as Button } from 'antd/es/button';
export { default as Space } from 'antd/es/space';
export { default as Divider } from 'antd/es/divider';
export { default as Typography } from 'antd/es/typography';

// 布局组件
export { default as Layout } from 'antd/es/layout';
export { default as Grid } from 'antd/es/grid';
export { default as Flex } from 'antd/es/flex';

// 导航组件
export { default as Menu } from 'antd/es/menu';
export { default as Breadcrumb } from 'antd/es/breadcrumb';
export { default as Dropdown } from 'antd/es/dropdown';
export { default as Pagination } from 'antd/es/pagination';

// 数据录入
export { default as Form } from 'antd/es/form';
export { default as Input } from 'antd/es/input';
export { default as Select } from 'antd/es/select';
export { default as Switch } from 'antd/es/switch';
export { default as Upload } from 'antd/es/upload';
export { default as Radio } from 'antd/es/radio';
export { default as Checkbox } from 'antd/es/checkbox';
export { default as Slider } from 'antd/es/slider';
export { default as ColorPicker } from 'antd/es/color-picker';

// 数据展示
export { default as Table } from 'antd/es/table';
export { default as List } from 'antd/es/list';
export { default as Card } from 'antd/es/card';
export { default as Avatar } from 'antd/es/avatar';
export { default as Badge } from 'antd/es/badge';
export { default as Statistic } from 'antd/es/statistic';
export { default as Tag } from 'antd/es/tag';
export { default as Tooltip } from 'antd/es/tooltip';
export { default as Tree } from 'antd/es/tree';
export { default as Empty } from 'antd/es/empty';
export { default as Collapse } from 'antd/es/collapse';

// 反馈组件
export { default as Alert } from 'antd/es/alert';
export { default as Modal } from 'antd/es/modal';
export { default as Message } from 'antd/es/message';
export { default as Notification } from 'antd/es/notification';
export { default as Spin } from 'antd/es/spin';
export { default as Skeleton } from 'antd/es/skeleton';
export { default as Progress } from 'antd/es/progress';
export { default as Result } from 'antd/es/result';

// 其他
export { default as ConfigProvider } from 'antd/es/config-provider';
export { default as App } from 'antd/es/app';
export { default as Row } from 'antd/es/row';
export { default as Col } from 'antd/es/col';
export { default as Timeline } from 'antd/es/timeline';
export { default as QRCode } from 'antd/es/qr-code';
export { default as Tabs } from 'antd/es/tabs';
export { default as InputNumber } from 'antd/es/input-number';

// 主题和样式相关
export { theme } from 'antd';
export type { ThemeConfig } from 'antd';

// 常用 Hook 导出
export { default as useMessage } from 'antd/es/message/useMessage';
export { default as useNotification } from 'antd/es/notification/useNotification';
export { default as useModal } from 'antd/es/modal/useModal';

// TypeScript 类型定义导出
export type {
  ButtonProps,
  ButtonType,
  ButtonSize,
  ButtonShape,
} from 'antd/es/button';

export type {
  FormProps,
  FormInstance,
  FormItemProps,
} from 'antd/es/form';

export type {
  TableProps,
  ColumnsType,
  ColumnType,
} from 'antd/es/table';

export type {
  UploadProps,
  UploadFile,
  RcFile,
} from 'antd/es/upload';

export type {
  MenuProps,
  MenuTheme,
} from 'antd/es/menu';

export type {
  InputProps,
  TextAreaProps,
} from 'antd/es/input';

export type {
  SelectProps,
  DefaultOptionType,
} from 'antd/es/select';

export type {
  ModalProps,
  ModalFuncProps,
} from 'antd/es/modal';

export type {
  ListProps,
  ListItemProps,
} from 'antd/es/list';

export type {
  CardProps,
} from 'antd/es/card';

export type {
  TreeProps,
  DataNode,
} from 'antd/es/tree';

export type {
  CollapseProps,
  CollapsePanelProps,
} from 'antd/es/collapse';

/**
 * Ant Design 主题配置
 * 基于设计系统的统一主题定制
 */
export const themeConfig = {
  token: {
    // 品牌色
    colorPrimary: '#1677ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#13c2c2',

    // 字体
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
      'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
      'Noto Color Emoji'`,
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,

    // 圆角
    borderRadius: 6,
    borderRadiusSM: 4,
    borderRadiusLG: 8,

    // 间距
    padding: 16,
    paddingSM: 12,
    paddingXS: 8,
    paddingLG: 24,
    paddingXL: 32,

    // 颜色
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f5f5f5',

    // 文字颜色
    colorText: 'rgba(0, 0, 0, 0.88)',
    colorTextSecondary: 'rgba(0, 0, 0, 0.65)',
    colorTextTertiary: 'rgba(0, 0, 0, 0.45)',

    // 边框颜色
    colorBorder: '#d9d9d9',
    colorBorderSecondary: '#f0f0f0',
  },
  components: {
    Layout: {
      colorBgHeader: '#ffffff',
      colorBgBody: '#f5f5f5',
      colorBgTrigger: '#ffffff',
    },
    Menu: {
      colorItemBgSelected: '#e6f7ff',
      colorItemTextSelected: '#1677ff',
      colorItemBgHover: '#f5f5f5',
    },
    Button: {
      borderRadius: 6,
      controlHeight: 32,
      controlHeightLG: 40,
      controlHeightSM: 24,
    },
    Card: {
      borderRadius: 6,
      paddingLG: 24,
    },
    Table: {
      borderRadius: 6,
      paddingContentVertical: 16,
    },
    Form: {
      itemMarginBottom: 24,
      verticalLabelPadding: '0 0 8px',
    },
    Input: {
      borderRadius: 6,
      controlHeight: 32,
      controlHeightLG: 40,
      controlHeightSM: 24,
    },
    Select: {
      borderRadius: 6,
      controlHeight: 32,
      controlHeightLG: 40,
      controlHeightSM: 24,
    },
    Modal: {
      borderRadius: 8,
    },
    Notification: {
      borderRadius: 8,
    },
    Message: {
      borderRadius: 6,
    },
  },
};