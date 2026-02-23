export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Bỏ dấu tiếng Việt
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Thay khoảng trắng bằng -
    .replace(/\s+/g, '-')
    // Xoá ký tự đặc biệt
    .replace(/[^\w-]+/g, '')
    // Tránh --
    .replace(/--+/g, '-')
    // Xoá - ở đầu và cuối nếu có
    .replace(/^-+|-+$/g, '');
}