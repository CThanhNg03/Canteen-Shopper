export type AppRole = "KITCHEN" | "ADMIN";
export type AppUser = { id: string; name: string; role: AppRole };
export async function getCurrentUser(): Promise<AppUser> {
  // Điểm nối nhỏ gọn để thay bằng Auth.js hoặc nhà cung cấp SSO khi triển khai.
  return { id: "demo-kitchen", name: "Nhân viên bếp", role: "KITCHEN" };
}
