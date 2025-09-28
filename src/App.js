// export default App;
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./pages/theme";
<<<<<<< HEAD

=======
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
>>>>>>> master
function App() {
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AppRoutes />
<<<<<<< HEAD
=======
            <ToastContainer position="top-right" autoClose={3000} />
>>>>>>> master
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );
}

export default App;
