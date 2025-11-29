## Họ và Tên: Đặng Nhớ Mãi
## MSSV: B2205947
## Môn học: Phát triển ứng dụng web
---

# Hệ Thống Quản Lý Thư Viện (Library Management System)

> Đồ án Web Fullstack - Ứng dụng quản lý mượn trả sách thư viện với mô hình phân tán (Admin & User riêng biệt).

## Giới Thiệu

Đây là hệ thống quản lý thư viện hiện đại, hỗ trợ quy trình mượn trả sách khép kín từ lúc Độc giả đặt sách online đến khi Thủ thư phê duyệt và trả sách. Hệ thống được xây dựng trên nền tảng **MEVN Stack** (MongoDB, Express, Vue.js, Node.js) với kiến trúc tách biệt giao diện quản trị và người dùng cuối.

## Công Nghệ Sử Dụng

### Backend (Server)
* ![NodeJS](https://img.shields.io/badge/Node.js-18.x-green) **Node.js**: Môi trường chạy Javascript.
* ![Express](https://img.shields.io/badge/Express.js-4.x-lightgrey) **Express**: Framework xây dựng RESTful API.
* ![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green) **MongoDB**: Cơ sở dữ liệu NoSQL.
* **JWT**: Xác thực và phân quyền (Authentication & Authorization).
* **Cloudinary + Multer**: Upload và quản lý hình ảnh bìa sách.

### Frontend (Client)
* ![VueJS](https://img.shields.io/badge/Vue.js-3.x-success) **Vue 3**: Framework giao diện (Composition API).
* ![Vite](https://img.shields.io/badge/Vite-4.x-blue) **Vite**: Build tool siêu tốc.
* **Pinia**: Quản lý trạng thái (State Management).
* **Vue Router**: Định tuyến trang.
* **Bootstrap 5 & FontAwesome**: Giao diện và Icon.
* **Axios**: Gọi API.

---

## Tính Năng Chính

### Phân hệ Quản trị (Frontend Admin) - Port 3001
1.  **Dashboard Thống kê:** Tổng quan số lượng sách, độc giả, phiếu đang mượn, phiếu quá hạn.
2.  **Quản lý Sách:**
    * CRUD (Thêm, Xem, Sửa, Xóa).
    * **Upload ảnh bìa sách** trực tiếp lên Cloudinary.
    * Tìm kiếm & Lọc theo thể loại.
    * Quản lý tồn kho tự động.
3.  **Quản lý Mượn/Trả:**
    * Duyệt yêu cầu mượn từ độc giả.
    * Xác nhận trả sách.
    * **Tự động tính tiền phạt** nếu quá hạn (5.000đ/ngày).
4.  **Quản lý Độc giả & NXB:** CRUD đầy đủ.

### Phân hệ Độc giả (Frontend User) - Port 3002
1.  **Tra cứu sách:** Giao diện Grid đẹp mắt, xem chi tiết sách, lọc theo danh mục.
2.  **Đặt mượn trực tuyến:** Đăng ký mượn sách (Status: Chờ duyệt).
3.  **Quản lý cá nhân:**
    * Xem **"Sách của tôi"**: Đang mượn, Lịch sử trả.
    * Cảnh báo sách sắp hết hạn/quá hạn.
    * Cập nhật hồ sơ & Đổi mật khẩu.

---
