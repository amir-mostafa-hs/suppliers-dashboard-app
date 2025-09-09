import api from "@/lib/api/axios";
import { useQuery } from "@tanstack/react-query";

// Step 1: Fetch basic user profile
const fetchUserProfile = async () => {
  const { data } = await api.get("/users/profile");
  return data.user;
};

// Step 2: Fetch supplier profile if the user is a supplier
const fetchSupplierProfile = async () => {
  const { data } = await api.get("/suppliers/profile");
  return data.profile;
};

export const useUser = () => {
  const userQuery = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
    retry: (failureCount, error: unknown) => {
      // Don't retry if it's an authentication error
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response: { status: number } };
        if (
          axiosError.response?.status === 401 ||
          axiosError.response?.status === 403
        ) {
          return false;
        }
      }
      return failureCount < 1;
    },
    staleTime: 5 * 60 * 1000,
  });

  const supplierQuery = useQuery({
    queryKey: ["supplierProfile"],
    queryFn: fetchSupplierProfile,
    // This query will only run if userQuery is successful AND the user role is 'SUPPLIER'
    enabled: userQuery.isSuccess && userQuery.data?.role === "SUPPLIER",
    retry: (failureCount, error: unknown) => {
      // Don't retry if it's an authentication error or 404 (profile not found)
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response: { status: number } };
        if (
          axiosError.response?.status === 401 ||
          axiosError.response?.status === 403 ||
          axiosError.response?.status === 404
        ) {
          return false;
        }
      }
      return failureCount < 1;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Combine both results into a single object
  return {
    user: userQuery.data,
    supplierStatus:
      supplierQuery.data?.supplierStatus ||
      // If supplier query failed with 404, it means no supplier profile exists
      (supplierQuery.error &&
      typeof supplierQuery.error === "object" &&
      "response" in supplierQuery.error &&
      (supplierQuery.error as { response: { status: number } }).response
        ?.status === 404
        ? null // null indicates no supplier profile
        : undefined), // undefined indicates loading or other error
    isLoading:
      userQuery.isLoading ||
      (supplierQuery.isLoading && supplierQuery.isEnabled),
    isError: userQuery.isError,
    error: userQuery.error,
  };
};
