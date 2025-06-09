// export default App;
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./pages/theme";

function App() {
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );
}

export default App;
