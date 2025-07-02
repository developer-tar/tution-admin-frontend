import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api";

const usePaginatedData = ({
  endpoint,
  queryParams = {},
  defaultPage = 0,
  rowsPerPage = 10,
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(defaultPage);

  useEffect(() => {
    const fetchData = async () => {
      if (!endpoint || !queryParams) return;

      setLoading(true);
      try {
        const res = await api.get(endpoint, {
          params: { ...queryParams },
        });

        const list = res.data?.data?.data || [];
        setData(list);
        if (!list.length) toast.info("No record found");
      } catch (error) {
        toast.error("Failed to load data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, JSON.stringify(queryParams)]);

  return { data, loading, page, setPage, rowsPerPage };
};

export default usePaginatedData;
