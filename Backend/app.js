const express = require("express");
const cors = require("cors");
const nhanviensRouter = require("./app/routes/nhanvien.route");
const docgiaRouter = require("./app/routes/docgia.route");
const nhaxuatbanRouter = require("./app/routes/nhaxuatban.route");
const sachRouter = require("./app/routes/sach.route");
const muonsachRouter = require("./app/routes/muonsach.route");
const ApiError = require("./app/api-error");
const uploadRouter = require("./app/routes/upload.route"); // Import mới
const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Quan Ly Muon Sach Web." });
});
app.use("/api/nhanviens", nhanviensRouter);
app.use("/api/docgias", docgiaRouter);
app.use("/api/nhaxuatbans", nhaxuatbanRouter);
app.use("/api/sachs", sachRouter);
app.use("/api/muonsachs", muonsachRouter);
app.use("/api/upload", uploadRouter); // Sử dụng uploadRouter
app.use((req, res, next) => {
  return next(new ApiError(404, "Resource not found"));
});
app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
});
module.exports = app;
