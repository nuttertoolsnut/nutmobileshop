import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    fontSize: 16,
    colorPrimary: '#fa8c16', // สีส้ม
    borderRadius: 6,
  },
  components: {
    Button: {
      colorPrimary: '#fa8c16',
      algorithm: true, 
    },
    Layout: {
      headerBg: '#ffffff',
    }
  },
};

export default theme;