// Đồng bộ với common/enums/nha-cung-cap.enum.ts
export const NhaCungCap = {
  LOCAL: 'local',
  GOOGLE: 'google',
} as const;

export type NhaCungCap = (typeof NhaCungCap)[keyof typeof NhaCungCap];
