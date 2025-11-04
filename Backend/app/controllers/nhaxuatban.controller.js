const NhaXuatBanService = require("../services/nhaxuatban.service"); 
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.create = async (req, res, next) => {
    if (!req.body?.MaNXB) {
        return next(new ApiError(400, "MaNXB can not be empty"));
    }

    try {
        const nhaXuatBanService = new NhaXuatBanService(MongoDB.client); 
        const existing = await nhaXuatBanService.findByMaNXB(req.body.MaNXB); 
        if (existing) {
            return next(new ApiError(409, "MaNXB already exists")); 
        }
        
        const document = await nhaXuatBanService.create(req.body);
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while creating the publisher") 
        );
    }
};

exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const nhaXuatBanService = new NhaXuatBanService(MongoDB.client); 
        const { name } = req.query; 
        if (name) {
            documents = await nhaXuatBanService.findByTenNXB(name); 
        } else {
            documents = await nhaXuatBanService.find({});
        }
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while retrieving publishers") 
        );
    }
    return res.send(documents);
};

exports.findOne = async (req, res, next) => {
    try {
        const nhaXuatBanService = new NhaXuatBanService(MongoDB.client); 
        const document = await nhaXuatBanService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Publisher not found")); 
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, `Error retrieving publisher with id=${req.params.id}`) 
        );
    }
};

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data to update can not be empty"));
    }

    try {
        const nhaXuatBanService = new NhaXuatBanService(MongoDB.client); 
        const document = await nhaXuatBanService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Publisher not found")); 
        }
        return res.send({ message: "Publisher was updated successfully" }); 
    } catch (error) {
        return next(
            new ApiError(500, `Error updating publisher with id=${req.params.id}`) 
        );
    }
};

exports.delete = async (req, res, next) => {
    try {
        const nhaXuatBanService = new NhaXuatBanService(MongoDB.client); 
        const document = await nhaXuatBanService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Publisher not found")); 
        }
        return res.send({ message: "Publisher was deleted successfully" }); 
    } catch (error) {
        return next(
            new ApiError(500, `Could not delete publisher with id=${req.params.id}`) 
        );
    }
};

exports.deleteAll = async (_req, res, next) => {
    try {
        const nhaXuatBanService = new NhaXuatBanService(MongoDB.client); 
        const deletedCount = await nhaXuatBanService.deleteAll();
        return res.send({
            message: `${deletedCount} publishers were deleted successfully`, 
        });
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while removing all publishers") 
        );
    }
};