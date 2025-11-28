const { ObjectId } = require("mongodb");

class MuonSachService {
    constructor(client) {
        this.MuonSach = client.db().collection("theodoimuonsach");
    }
    extractMuonSachData(payload) {
        const muonSach = {
            MaDocGia: payload.MaDocGia,  
            MaSach: payload.MaSach,   
            MSNV: payload.MSNV,     
            NgayMuon: payload.NgayMuon,
            NgayTra: payload.NgayTra, 
            HanTra: payload.HanTra || this.calculateDueDate(payload.NgayMuon),
            TrangThai: payload.TrangThai !== undefined ? payload.TrangThai : 0
        };

        Object.keys(muonSach).forEach(
            (key) => muonSach[key] === undefined && delete muonSach[key]
        );
        return muonSach;
    }
    calculateDueDate(ngayMuon) {
        if (!ngayMuon) return null;
        const date = new Date(ngayMuon);
        // Cộng thêm 14 ngày
        date.setDate(date.getDate() + 14); 
        // Trả về định dạng YYYY-MM-DD
        return date.toISOString().split('T')[0];
    }
    async create(payload) {
        const muonSach = this.extractMuonSachData(payload);
        muonSach.NgayTra = muonSach.NgayTra || null; 

        const result = await this.MuonSach.insertOne(muonSach);
        return await this.findById(result.insertedId);
    }

    async find(filter) {
        const cursor = await this.MuonSach.find(filter);
        return await cursor.toArray();
    }

    async findByMaDocGia(maDocGia) {
        return await this.find({ MaDocGia: maDocGia });
    }
    
    async findByMaSach(maSach) {
        return await this.find({ MaSach: maSach });
    }

    async findById(id) {
        return await this.MuonSach.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(String(id)) : null,
        });
    }
    async countActiveBorrowsByReader(maDocGia) {
        // Điều kiện: Đúng Mã ĐG và NgayTra là null (chưa trả)
        const count = await this.MuonSach.countDocuments({
            MaDocGia: maDocGia,
            NgayTra: null 
        });
        return count;
    }
    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(String(id)) : null,
        };
        const updateData = {
            NgayTra: payload.NgayTra
        };
        
        const result = await this.MuonSach.findOneAndUpdate(
            filter,
            { $set: updateData },
            { returnDocument: "after" }
        );
        return result;
    }

    async delete(id) {
        const result = await this.MuonSach.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(String(id)) : null,
        });
        return result;
    }

    async deleteAll() {
        const result = await this.MuonSach.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = MuonSachService;