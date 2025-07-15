// export default App;
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./pages/theme";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
function App() {
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AppRoutes />
            <ToastContainer position="top-right" autoClose={3000} />
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );
}

export default App;
