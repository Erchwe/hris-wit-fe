import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from '../../utils/api.ts';
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { Label, TextInput, Select, Textarea, FileInput, Button } from "flowbite-react";

interface Option { id: string; name: string; }

export default function UpdateInventarisPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState<any>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [brands, setBrands] = useState<Option[]>([]);
  const [vendors, setVendors] = useState<Option[]>([]);
  const [rooms, setRooms] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [res, brandRes, vendorRes, roomRes, catRes] = await Promise.all([
          api.get(`/inventaris/with-relations/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/brand", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/vendor", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/ruangan", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/kategori", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const item = res.data.data;
        const clean = (val: any) => {
          if (val === null || val === undefined) return "";
          if (typeof val === "object" && "String" in val) return val.String;
          return val;
        };

        setForm({
          inventaris_id: clean(item.inventaris_id),
          nama_inventaris: clean(item.nama_inventaris),
          tanggal_beli: clean(item.tanggal_beli),
          harga: clean(item.harga),
          jumlah: clean(item.jumlah),
          keterangan: clean(item.keterangan),
          old_inventory_code: clean(item.old_inventory_code),
          status: clean(item.status),
          kategori_id: clean(item.kategori_id),
          ruangan_id: clean(item.ruangan_id),
          vendor_id: clean(item.vendor_id),
          brand_id: clean(item.brand_id),
          image_url: clean(item.image_url),
          updated_by: "admin",
        });
        setPreviewUrl(clean(item.image_url));

        setBrands(brandRes.data.data.map((b: any) => ({ id: b.brand_id, name: b.nama_brand })));
        setVendors(vendorRes.data.data.map((v: any) => ({ id: v.vendor_id, name: v.nama_vendor })));
        setRooms(roomRes.data.data.map((r: any) => ({ id: r.ruangan_id, name: r.nama_ruangan })));
        setCategories(catRes.data.data.map((c: any) => ({ id: c.kategori_id, name: c.nama_kategori })));
      } catch {
        toast.error("Gagal memuat data");
      }
    };
    fetchData();
  }, [id, token]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const requiredFields = [
      "inventaris_id", "nama_inventaris", "brand_id", "tanggal_beli", "harga", "jumlah",
      "vendor_id", "kategori_id", "ruangan_id", "status", "updated_by"
    ];

    for (const field of requiredFields) {
      const value = form[field];
      if (!value || value === "" || value === "0") {
        Swal.fire({ icon: "warning", title: "Field wajib diisi", text: `Kolom ${field.replace("_", " ")} tidak boleh kosong` });
        return;
      }
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (val !== null && val !== undefined && JSON.stringify(val) !== "{}") {
        formData.append(key, typeof val === "object" ? JSON.stringify(val) : String(val));
      }
    });

    if (imageFile) {
      formData.append("image_file", imageFile);
    }

    try {
      await api.put(`/inventaris/update/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({ icon: "success", title: "Berhasil", text: "Inventaris berhasil diperbarui" });
      navigate("/inventaris/listinventaris");
    } catch {
      Swal.fire({ icon: "error", title: "Gagal", text: "Inventaris gagal diperbarui" });
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Update Inventaris</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><Label value="Nama Inventaris *" /><TextInput name="nama_inventaris" value={form.nama_inventaris || ""} onChange={handleChange} /></div>
        <div><Label value="Tanggal Beli *" /><TextInput type="date" name="tanggal_beli" value={form.tanggal_beli || ""} onChange={handleChange} /></div>
        <div><Label value="Harga *" /><TextInput name="harga" value={form.harga || ""} onChange={handleChange} type="number" /></div>
        <div><Label value="Jumlah *" /><TextInput name="jumlah" value={form.jumlah || ""} onChange={handleChange} type="number" /></div>
        <div><Label value="Keterangan" /><Textarea name="keterangan" value={form.keterangan || ""} onChange={handleChange} /></div>
        <div><Label value="Kode Lama" /><TextInput name="old_inventory_code" value={form.old_inventory_code || ""} onChange={handleChange} /></div>

        <div><Label value="Status *" /><Select name="status" value={form.status || ""} onChange={handleChange} required>
          <option value="">Pilih Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Tidak Aktif">Tidak Aktif</option>
        </Select></div>

        <div><Label value="Kategori *" /><Select name="kategori_id" value={form.kategori_id || ""} onChange={handleChange} required>
          <option value="">Pilih Kategori</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select></div>

        <div><Label value="Ruangan *" /><Select name="ruangan_id" value={form.ruangan_id || ""} onChange={handleChange} required>
          <option value="">Pilih Ruangan</option>
          {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </Select></div>

        <div><Label value="Vendor *" /><Select name="vendor_id" value={form.vendor_id || ""} onChange={handleChange} required>
          <option value="">Pilih Vendor</option>
          {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </Select></div>

        <div><Label value="Brand *" /><Select name="brand_id" value={form.brand_id || ""} onChange={handleChange} required>
          <option value="">Pilih Brand</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </Select></div>

        <div>
          <Label htmlFor="image_file" value="Upload Gambar" />
          <FileInput accept="image/*" onChange={handleImage} />
          {previewUrl && <img src={previewUrl} className="h-32 mt-2 object-contain border rounded" />}
        </div>

        <Button type="submit">Simpan Perubahan</Button>
      </form>
    </div>
  );
}
