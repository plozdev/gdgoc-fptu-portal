/**
 * Tiện ích chuẩn hóa hiển thị ngày tháng theo định dạng Việt Nam: dd/MM/yyyy
 */

export const formatDateToDDMMYYYY = (dateInput?: string | Date | null): string => {
  if (!dateInput) return '--';

  if (dateInput instanceof Date) {
    const d = String(dateInput.getDate()).padStart(2, '0');
    const m = String(dateInput.getMonth() + 1).padStart(2, '0');
    const y = dateInput.getFullYear();
    return `${d}/${m}/${y}`;
  }

  const str = String(dateInput).trim();
  
  // Nếu đã là dạng dd/MM/yyyy chuẩn
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    return str;
  }

  // Nếu là dạng ISO yyyy-MM-dd
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const datePart = str.split('T')[0];
    const [y, m, d] = datePart.split('-');
    return `${d}/${m}/${y}`;
  }

  // Nếu là dạng tiếng Anh như "September 20, 2026" hoặc "Nov 15, 2026"
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const d = String(parsed.getDate()).padStart(2, '0');
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const y = parsed.getFullYear();
    return `${d}/${m}/${y}`;
  }

  return str;
};

/**
 * Chuyển từ dd/MM/yyyy sang yyyy-MM-dd (cho thẻ input type="date")
 */
export const toISODateString = (ddmmyyyy: string): string => {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(ddmmyyyy)) {
    const [d, m, y] = ddmmyyyy.split('/');
    return `${y}-${m}-${d}`;
  }
  return ddmmyyyy;
};
