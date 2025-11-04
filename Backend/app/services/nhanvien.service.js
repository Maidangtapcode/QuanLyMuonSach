const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
class NhanVienService {
  constructor(client) {
    this.NhanVien = client.db().collection("nhanvien");
  }
  extractNhanVienData(payload) {
    const nhanvien = {
      MSNV: payload.MSNV,
      HoTenNV: payload.HoTenNV,
      Password: payload.Password,
      ChucVu: payload.ChucVu,
      DiaChi: payload.DiaChi,
      SoDienThoai: payload.SoDienThoai,
    };
    Object.keys(nhanvien).forEach(
      (key) => nhanvien[key] === undefined && delete nhanvien[key]
    );
    return nhanvien;
  }

  async create(payload) {
    const nhanvien = this.extractNhanVienData(payload);
    if (nhanvien.Password) {
      const salt = await bcrypt.genSalt(10);
      nhanvien.Password = await bcrypt.hash(nhanvien.Password, salt);
    }

    const result = await this.NhanVien.insertOne(nhanvien);
    return await this.findById(result.insertedId);
  }

  async find(filter) {
    const cursor = await this.NhanVien.find(filter);
    return await cursor.toArray();
  }

  async findByHoTenNV(name) {
    return await this.find({
      HoTenNV: { $regex: new RegExp(name), $options: "i" },
    });
  }
  async findById(id) {
    return await this.NhanVien.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }
  async findByMSNV(msnv) {
    return await this.NhanVien.findOne({ MSNV: msnv });
  }

  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = this.extractNhanVienData(payload);
    if (update.Password) {
      const salt = await bcrypt.genSalt(10);
      update.Password = await bcrypt.hash(update.Password, salt);
    }
    const result = await this.NhanVien.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );
    return result;
  }

  async delete(id) {
    const result = await this.NhanVien.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  async deleteAll() {
    const result = await this.NhanVien.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = NhanVienService;