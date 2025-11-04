const MuonSachService = require("../services/muonsach.service"); 
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error"); 

exports.create = async (req, res, next) => {
    if (!req.body?.MaDocGia || !req.body?.MaSach || !req.body?.NgayMuon) {
        return next(new ApiError(400, "MaDocGia, MaSach, NgayMuon can not be empty"));
    }

    try {
        const muonSachService = new MuonSachService(MongoDB.client); 
        const document = await muonSachService.create(req.body);
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

exports.update = async (req, res, next) => {
    if (!req.body?.NgayTra) {
        return next(new ApiError(400, "NgayTra to update can not be empty"));
    }

    try {
        const muonSachService = new MuonSachService(MongoDB.client); 
        const document = await muonSachService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Borrow record not found")); 
        }
        return res.send({ message: "Borrow record was updated successfully" }); 
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