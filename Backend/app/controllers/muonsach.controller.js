const MuonSachService = require("../services/muonsach.service"); 
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error"); 
const SachService = require("../services/sach.service");

exports.create = async (req, res, next) => {
    if (!req.body?.MaDocGia || !req.body?.MaSach || !req.body?.NgayMuon) {
        return next(new ApiError(400, "MaDocGia, MaSach, NgayMuon can not be empty"));
    }
    try {
        const muonSachService = new MuonSachService(MongoDB.client);
        const sachService = new SachService(MongoDB.client);

        // Check số lượng < 3
        const soSachDangMuon = await muonSachService.countActiveBorrowsByReader(req.body.MaDocGia);
        if (soSachDangMuon >= 3) {
            return next(new ApiError(400, "Độc giả đã mượn tối đa 3 cuốn."));
        }

        // Check tồn kho
        const book = await sachService.findByMaSach(req.body.MaSach);
        if (!book || book.soQuyenHienCo <= 0) {
            return next(new ApiError(400, "Sách đã hết."));
        }

        const document = await muonSachService.create(req.body);
        if (document) {
            await sachService.updateStockByMaSach(req.body.MaSach, -1);
        }
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, "Error creating borrow record"));
    }
};

exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const muonSachService = new MuonSachService(MongoDB.client);
        const { maDocGia } = req.query;
        if (maDocGia) {
            documents = await muonSachService.find({ MaDocGia: maDocGia }); // Sửa lại find cho đúng
        } else {
            documents = await muonSachService.find({});
        }
    } catch (error) {
        return next(new ApiError(500, "Error retrieving"));
    }
    return res.send(documents);
};

exports.findOne = async (req, res, next) => {
    try {
        const muonSachService = new MuonSachService(MongoDB.client);
        const document = await muonSachService.findById(req.params.id);
        if (!document) return next(new ApiError(404, "Not found"));
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, "Error retrieving"));
    }
};

// Hàm Update phiếu mượn
exports.update = async (req, res, next) => {
    // Logic: Có TrangThai (Duyệt) HOẶC có NgayTra (Trả)
    const isApproving = req.body.TrangThai !== undefined; 
    const isReturning = req.body.NgayTra; 

    if (!isApproving && !isReturning) {
        return next(new ApiError(400, "Dữ liệu không hợp lệ"));
    }

    try {
        const muonSachService = new MuonSachService(MongoDB.client);
        const sachService = new SachService(MongoDB.client);

        const existingRecord = await muonSachService.findById(req.params.id);
        if (!existingRecord) {
            return next(new ApiError(404, "Phiếu mượn không tìm thấy."));
        }

        // 1. LOGIC TRẢ SÁCH
        if (isReturning) {
            if (existingRecord.NgayTra) {
                return next(new ApiError(400, "Sách này đã trả rồi."));
            }

            // Tính tiền phạt (như bài trước)
            const ngayTra = new Date(req.body.NgayTra);
            const hanTra = new Date(existingRecord.HanTra);
            let tienPhat = 0;
            ngayTra.setHours(0,0,0,0);
            hanTra.setHours(0,0,0,0);
            if (ngayTra > hanTra) {
                const diffDays = Math.round((ngayTra - hanTra) / (1000 * 60 * 60 * 24));
                tienPhat = diffDays * 5000;
            }

            // Cập nhật
            const document = await muonSachService.update(req.params.id, { 
                NgayTra: req.body.NgayTra,
                TienPhat: tienPhat,
                TrangThai: 2 // <--- QUAN TRỌNG: ÉP CỨNG TRẠNG THÁI LÀ 2 (ĐÃ TRẢ)
            });
            console.log("Document sau update:", document);
            if (document) {
                console.log("Đang cộng tồn kho cho sách:", existingRecord.MaSach); // Log kiểm tra
                await sachService.updateStockByMaSach(existingRecord.MaSach, +1);
            }
            return res.send({ message: "Đã trả sách", tienPhat: tienPhat });
        }

        // 2. LOGIC DUYỆT SÁCH
        if (isApproving) {
            await muonSachService.update(req.params.id, {
                TrangThai: req.body.TrangThai, // Thường là 1
                MSNV: req.body.MSNV
            });
            return res.send({ message: "Đã duyệt thành công" });
        }

    } catch (error) {
        return next(new ApiError(500, "Error updating borrow record"));
    }
};

exports.delete = async (req, res, next) => {
    try {
        const muonSachService = new MuonSachService(MongoDB.client);
        const document = await muonSachService.delete(req.params.id);
        if (!document) return next(new ApiError(404, "Not found"));
        return res.send({ message: "Deleted" });
    } catch (error) {
        return next(new ApiError(500, "Could not delete"));
    }
};

exports.deleteAll = async (_req, res, next) => {
    try {
        const muonSachService = new MuonSachService(MongoDB.client);
        const count = await muonSachService.deleteAll();
        return res.send({ message: `${count} deleted` });
    } catch (error) {
        return next(new ApiError(500, "Error delete all"));
    }
};