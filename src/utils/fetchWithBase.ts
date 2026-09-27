import type { AxiosRequestConfig } from "axios";
import { api } from "@/lib/axios";

export const fetchWithBase = async <T = any>(
  url: string,
  options?: AxiosRequestConfig
): Promise<T> => {
  const response = await api({
    url,
    ...options,
  });

  return response.data;
};