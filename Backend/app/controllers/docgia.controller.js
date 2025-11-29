const DocGiaService = require("../services/docgia.service"); 
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const jwt = require("jsonwebtoken"); 
const bcrypt = require("bcryptjs"); 
const config = require("../config/index.js");

exports.create = async (req, res, next) => {
    if (!req.body?.MaDocGia || !req.body?.Password) {
        return next(new ApiError(400, "MaDocGia and Password can not be empty"));
    }

    try {
        const docGiaService = new DocGiaService(MongoDB.client); 

        const existing = await docGiaService.findByMaDocGia(req.body.MaDocGia); 
        if (existing) {
            return next(new ApiError(409, "MaDocGia already exists")); 
        }
        
        const document = await docGiaService.create(req.body);
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while creating the reader") 
        );
    }
};

exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const docGiaService = new DocGiaService(MongoDB.client); 
        const { name } = req.query; 
        if (name) {
            documents = await docGiaService.findByTen(name); 
        } else {
            documents = await docGiaService.find({});
        }
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while retrieving readers") 
        );
    }
    return res.send(documents);
};

exports.findOne = async (req, res, next) => {
    try {
        const docGiaService = new DocGiaService(MongoDB.client); 
        const document = await docGiaService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Reader not found")); 
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, `Error retrieving reader with id=${req.params.id}`) 
        );
    }
};

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data to update can not be empty"));
    }

    try {
        const docGiaService = new DocGiaService(MongoDB.client); 
        const document = await docGiaService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Reader not found")); 
        }
        return res.send({ message: "Reader was updated successfully" }); 
    } catch (error) {
        return next(
            new ApiError(500, `Error updating reader with id=${req.params.id}`) 
        );
    }
};

exports.delete = async (req, res, next) => {
    try {
        const docGiaService = new DocGiaService(MongoDB.client); 
        const document = await docGiaService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Reader not found")); 
        }
        return res.send({ message: "Reader was deleted successfully" }); 
    } catch (error) {
        return next(
            new ApiError(500, `Could not delete reader with id=${req.params.id}`) 
        );
    }
};

exports.deleteAll = async (_req, res, next) => {
    try {
        const docGiaService = new DocGiaService(MongoDB.client); 
        const deletedCount = await docGiaService.deleteAll();
        return res.send({
            message: `${deletedCount} readers were deleted successfully`, 
        });
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while removing all readers") 
        );
    }
};
exports.login = async (req, res, next) => {
    if (!req.body?.MaDocGia || !req.body?.Password) {
        return next(new ApiError(400, "MaDocGia and Password are required"));
    }
    try {
        const docGiaService = new DocGiaService(MongoDB.client);
        const user = await docGiaService.findByMaDocGia(req.body.MaDocGia);
        if (!user) {
            return next(new ApiError(401, "Incorrect MaDocGia or Password"));
        }
        const passwordMatch = await bcrypt.compare(
            req.body.Password,
            user.Password 
        );

        if (!passwordMatch) {
            return next(new ApiError(401, "Incorrect MaDocGia or Password"));
        }
        const token = jwt.sign(
            { userId: user._id, MaDocGia: user.MaDocGia, role: "docgia" }, 
            config.jwt.secret, 
            { expiresIn: "1h" } 
        );
        const { Password, ...userWithoutPassword } = user;
        
        return res.send({
            message: "Login successful",
            token: token,
            user: userWithoutPassword
        });

    } catch (error) {
        return next(new ApiError(500, "An error occurred during login"));
    }
};
exports.updateProfile = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data to update can not be empty"));
    }

    try {
        const docGiaService = new DocGiaService(MongoDB.client);
        // Lấy ID từ Token (do middleware verifyToken gắn vào req.user)
        const userId = req.user.userId; 

        // Chỉ cho phép sửa một số trường nhất định (Tránh sửa MaDocGia hay Password ở đây)
        const updateData = {
            HoLot: req.body.HoLot,
            Ten: req.body.Ten,
            NgaySinh: req.body.NgaySinh,
            Phai: req.body.Phai,
            DiaChi: req.body.DiaChi,
            DienThoai: req.body.DienThoai
        };

        const document = await docGiaService.update(userId, updateData);
        if (!document) {
            return next(new ApiError(404, "Reader not found"));
        }
        return res.send({ message: "Profile updated successfully", user: document });
    } catch (error) {
        return next(new ApiError(500, "Error updating profile"));
    }
};

// === 2. HÀM ĐỔI MẬT KHẨU ===
exports.changePassword = async (req, res, next) => {
    if (!req.body?.oldPassword || !req.body?.newPassword) {
        return next(new ApiError(400, "Old password and new password are required"));
    }

    try {
        const docGiaService = new DocGiaService(MongoDB.client);
        const userId = req.user.userId;

        // 1. Lấy thông tin độc giả từ DB (bao gồm mật khẩu cũ đã hash)
        const user = await docGiaService.findById(userId);
        if (!user) {
            return next(new ApiError(404, "User not found"));
        }

        // 2. So sánh mật khẩu cũ người dùng nhập với mật khẩu trong DB
        const passwordIsValid = await bcrypt.compare(req.body.oldPassword, user.Password);
        if (!passwordIsValid) {
            return next(new ApiError(401, "Mật khẩu cũ không chính xác!"));
        }

        // 3. Hash mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(req.body.newPassword, salt);

        // 4. Cập nhật vào DB
        // (Lưu ý: Bạn phải đảm bảo hàm update của service nhận trường Password)
        // Để chắc chắn, chúng ta gọi update trực tiếp với object password
        await docGiaService.update(userId, { Password: hashedNewPassword });

        return res.send({ message: "Đổi mật khẩu thành công!" });

    } catch (error) {
        console.log(error);
        return next(new ApiError(500, "Error changing password"));
    }
};