import { useState, useEffect } from "react";

/**
 * Hook để trì hoãn một giá trị thay đổi liên tục, tránh gọi API quá nhiều lần
 * @param value Giá trị cần trì hoãn
 * @param delay Thời gian trì hoãn (ms)
 * @returns Giá trị sau khi đã trì hoãn
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Tạo timer để cập nhật debouncedValue sau delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Xóa timer nếu value thay đổi hoặc component unmount
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
