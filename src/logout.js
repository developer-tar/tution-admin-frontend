import { toast } from "react-toastify";
const logout = () => {
  localStorage.clear();
  toast.success("Logged out successfully");
};
export default logout;