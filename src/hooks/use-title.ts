import { useEffect } from "react";

/**
 * Hook để thiết lập tiêu đề trang
 * @param title Tiêu đề muốn hiển thị
 */
export function useTitle(title: string) {
  useEffect(() => {
    // Lưu tiêu đề cũ
    const prevTitle = document.title;
    // Cập nhật tiêu đề mới
    document.title = title;

    // Khôi phục tiêu đề cũ khi component unmount
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}
