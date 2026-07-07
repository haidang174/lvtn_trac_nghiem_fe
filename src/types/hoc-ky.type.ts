// Khớp entity HOC_KY. daKetThuc là trường tính động (BE tính, không lưu DB).
export interface HocKy {
  maHocKy: number;
  tenHocKy: string;
  namHoc: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  daKetThuc: boolean;
}
