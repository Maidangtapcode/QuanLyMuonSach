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
        const book = await sachService.findByMaSach(req.body.MaSach);
        const soSachDangMuon = await muonSachService.countActiveBorrowsByReader(req.body.MaDocGia);
        // Nếu đã mượn từ 3 cuốn trở lên -> Chặn luôn
        if (soSachDangMuon >= 3) {
            return next(new ApiError(400, `Độc giả này đang mượn ${soSachDangMuon} cuốn. Quy định chỉ được mượn tối đa 3 cuốn!`));
        }
        if (!book) {
            return next(new ApiError(404, "Sách không tồn tại."));
        }
        if (book.soQuyenHienCo <= 0) {
            return next(new ApiError(400, "Sách đã hết, không thể mượn."));
        }
        const document = await muonSachService.create(req.body);
        if (document) {
            await sachService.updateStockByMaSach(req.body.MaSach, -1);
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while creating the borrow record")
        );
    }
};

exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const muonSachService = new MuonSachService(MongoDB.client); 
        const { maDocGia } = req.query;
        if (maDocGia) {
            documents = await muonSachService.findByMaDocGia(maDocGia); 
        } else {
            documents = await muonSachService.find({});
        }
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while retrieving borrow records") 
        );
    }
    return res.send(documents);
};

exports.findOne = async (req, res, next) => {
    try {
        const muonSachService = new MuonSachService(MongoDB.client); 
        const document = await muonSachService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Borrow record not found")); 
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, `Error retrieving borrow record with id=${req.params.id}`) 
        );
    }
};

// Hàm Update (Xử lý cả DUYỆT và TRẢ)
exports.update = async (req, res, next) => {
    // 1. Kiểm tra dữ liệu đầu vào: Phải có ít nhất 1 trong 2 hành động
    const isApproving = req.body.TrangThai !== undefined; // Đang duyệt?
    const isReturning = req.body.NgayTra; // Đang trả?

    if (!isApproving && !isReturning) {
        return next(new ApiError(400, "Dữ liệu cập nhật không hợp lệ (Cần TrangThai hoặc NgayTra)"));
    }

    try {
        const muonSachService = new MuonSachService(MongoDB.client);
        const sachService = new SachService(MongoDB.client);

        // 2. Tìm phiếu mượn cũ để lấy thông tin
        const existingRecord = await muonSachService.findById(req.params.id);
        if (!existingRecord) {
            return next(new ApiError(404, "Phiếu mượn không tìm thấy."));
        }

        // 3. XỬ LÝ LOGIC TRẢ SÁCH
        if (isReturning) {
            if (existingRecord.NgayTra) {
                return next(new ApiError(400, "Sách này đã được trả trước đó."));
            }
            // Nếu trả sách thì cập nhật NgayTra
            const document = await muonSachService.update(req.params.id, { 
                NgayTra: req.body.NgayTra 
            });
            
            // Tăng tồn kho lại (+1)
            if (document) {
                await sachService.updateStockByMaSach(existingRecord.MaSach, +1);
            }
            return res.send({ message: "Đã trả sách thành công" });
        }

        // 4. XỬ LÝ LOGIC DUYỆT SÁCH
        if (isApproving) {
            // Cập nhật Trạng thái và MSNV người duyệt
            const document = await muonSachService.update(req.params.id, {
                TrangThai: req.body.TrangThai,
                MSNV: req.body.MSNV
            });
            // Lưu ý: Không cần trừ tồn kho ở đây nữa, 
            // vì chúng ta đã trừ ngay lúc Độc giả bấm "Đặt mượn" rồi.
            
            return res.send({ message: "Đã duyệt phiếu mượn thành công" });
        }

    } catch (error) {
        return next(
            new ApiError(500, `Error updating borrow record with id=${req.params.id}`)
        );
    }
};

exports.delete = async (req, res, next) => {
    try {
        const muonSachService = new MuonSachService(MongoDB.client); 
        const document = await muonSachService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Borrow record not found")); 
        }
        return res.send({ message: "Borrow record was deleted successfully" }); 
    } catch (error) {
        return next(
            new ApiError(500, `Could not delete borrow record with id=${req.params.id}`) 
        );
    }
};

exports.deleteAll = async (_req, res, next) => {
    try {
        const muonSachService = new MuonSachService(MongoDB.client); 
        const deletedCount = await muonSachService.deleteAll();
        return res.send({
            message: `${deletedCount} borrow records were deleted successfully`, 
        });
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while removing all borrow records") 
        );
    }
};