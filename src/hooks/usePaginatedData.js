import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api";

const usePaginatedData = ({
  endpoint,
  queryParams = {},
  defaultPage = 0,
  rowsPerPage = 10,
  enabled = true,
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(defaultPage);

  useEffect(() => {
    if (!enabled) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(endpoint, {
          params: { ...queryParams },
        });

        const list = res.data?.data?.data || res.data?.data || [];

        setData(Array.isArray(list) ? list : []);
        if (Array.isArray(list) && list.length === 0) {
          toast.info("No record found");
        }
      } catch (error) {
        toast.error("Failed to load data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, JSON.stringify(queryParams), enabled]);

  return { data, loading, page, setPage, rowsPerPage };
};

export default usePaginatedData;
