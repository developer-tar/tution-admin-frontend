import { useEffect, useState } from "react";
import api from "../api"; 
import { toast } from "react-toastify";

const useCommonDropdowns = (params = []) => {
  const [dropdowns, setDropdowns] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.length) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const responses = await Promise.all(
          params.map(param => api.get(`common/data?param=${param}`))
        );

        const mapped = {};
        params.forEach((key, index) => {
          mapped[key] = responses[index].data.data;
        });

        setDropdowns(mapped);
      } catch (error) {
        console.error("Dropdown fetch error:", error);
        toast.error("Failed to load dropdown data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  return { dropdowns, loading };
};
export default useCommonDropdowns;
