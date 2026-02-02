  import QRCode from 'qrcode';
  async function generateQRCode(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',  // 二维码颜色
        light: '#FFFFFF'  // 背景色
      }
    });
  } catch (err) {
    console.error('生成二维码失败:', err);
    throw err;
  }
}