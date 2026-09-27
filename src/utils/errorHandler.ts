export const getErrorMessage = (error: any): string => {
    return (
        error?.response?.data?.message ||
        error?.message ||
        "เกิดข้อผิดพลาด"
    );
};