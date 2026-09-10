import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./redux/AuthContext.jsx";
import "./globals.css";

import viVN from "antd/locale/vi_VN";
import { ConfigProvider } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: "#0284c7",
          fontFamily: "Inter, sans-serif",
          borderRadius: 8,
        },
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>
);
