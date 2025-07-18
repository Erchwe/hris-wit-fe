import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import api from '../../utils/api.ts';
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { Select, TextInput, Textarea, Label, FileInput } from "flowbite-react";

interface Vendor {
  vendor_id: string;
  nama_vendor: string;
}
interface Kategori {
  kategori_id: string;
  nama_kategori: string;
}
interface Ruangan {
  ruangan_id: string;
  nama_ruangan: string;
}
interface Brand {
  brand_id: string;
  nama_brand: string;
}
interface InventoryForm {
  nama_inventaris: string;
  brand_id: string;
  tanggal_beli: string;
  harga: string;
  jumlah: string;
  vendor_id: string;
  keterangan: string;
  kategori_id: string;
  ruangan_id: string;
  old_inventory_code: string;
  status: string;
}

export default function InsertInventoryForm() {
  const [form, setForm] = useState<InventoryForm>({
    nama_inventaris: "",
    brand_id: "",
    tanggal_beli: "",
    harga: "",
    jumlah: "",
    vendor_id: "",
    keterangan: "",
    kategori_id: "",
    ruangan_id: "",
    old_inventory_code: "",
    status: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Kategori[]>([]);
  const [rooms, setRooms] = useState<Ruangan[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [vendorRes, categoryRes, roomRes, brandRes] = await Promise.all([
          api.get("/vendor", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/kategori", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/ruangan", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/brand", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setVendors(vendorRes.data.data);
        setCategories(categoryRes.data.data);
        setRooms(roomRes.data.data);
        setBrands(brandRes.data.data);
      } catch (error) {
        toast.error("Gagal memuat data dropdown.");
      }
    };
    fetchDropdowns();
  }, [token]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    const requiredFields: (keyof InventoryForm)[] = [
      "nama_inventaris", "brand_id", "tanggal_beli", "harga", "jumlah",
      "vendor_id", "kategori_id", "ruangan_id", "status"
    ];

    for (const field of requiredFields) {
      if (!form[field]) {
        toast.warning(`Field ${field.replace("_", " ")} wajib diisi`);
        return;
      }
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      formData.append(key, val);
    });

    if (imageFile) {
      formData.append("image_file", imageFile);
    }

    try {
      await api.post("/inventaris/insert", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Inventaris berhasil ditambahkan!",
      });

      setForm({
        nama_inventaris: "",
        brand_id: "",
        tanggal_beli: "",
        harga: "",
        jumlah: "",
        vendor_id: "",
        keterangan: "",
        kategori_id: "",
        ruangan_id: "",
        old_inventory_code: "",
        status: "",
      });
      setImageFile(null);
      setPreviewUrl(null);
    } catch (error) {
      toast.error("Gagal menambahkan inventory.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
      <div><Label htmlFor="nama_inventaris" value="Nama Inventaris *" /><TextInput id="nama_inventaris" name="nama_inventaris" value={form.nama_inventaris} onChange={handleChange} required /></div>
      <div><Label htmlFor="brand_id" value="Brand *" /><Select id="brand_id" name="brand_id" value={form.brand_id} onChange={handleChange} required><option value="">Pilih Brand</option>{brands.map(b => <option key={b.brand_id} value={b.brand_id}>{b.nama_brand}</option>)}</Select></div>
      <div><Label htmlFor="tanggal_beli" value="Tanggal Beli *" /><TextInput type="date" id="tanggal_beli" name="tanggal_beli" value={form.tanggal_beli} onChange={handleChange} required /></div>
      <div><Label htmlFor="harga" value="Harga *" /><TextInput type="number" id="harga" name="harga" value={form.harga} onChange={handleChange} required /></div>
      <div><Label htmlFor="jumlah" value="Jumlah *" /><TextInput type="number" id="jumlah" name="jumlah" value={form.jumlah} onChange={handleChange} required /></div>
      <div><Label htmlFor="vendor_id" value="Vendor *" /><Select id="vendor_id" name="vendor_id" value={form.vendor_id} onChange={handleChange} required><option value="">Pilih Vendor</option>{vendors.map(v => <option key={v.vendor_id} value={v.vendor_id}>{v.nama_vendor}</option>)}</Select></div>
      <div><Label htmlFor="keterangan" value="Keterangan" /><Textarea id="keterangan" name="keterangan" value={form.keterangan} onChange={handleChange} /></div>
      <div><Label htmlFor="kategori_id" value="Kategori *" /><Select id="kategori_id" name="kategori_id" value={form.kategori_id} onChange={handleChange} required><option value="">Pilih Kategori</option>{categories.map(c => <option key={c.kategori_id} value={c.kategori_id}>{c.nama_kategori}</option>)}</Select></div>
      <div><Label htmlFor="ruangan_id" value="Ruangan *" /><Select id="ruangan_id" name="ruangan_id" value={form.ruangan_id} onChange={handleChange} required><option value="">Pilih Ruangan</option>{rooms.map(r => <option key={r.ruangan_id} value={r.ruangan_id}>{r.nama_ruangan}</option>)}</Select></div>
      <div><Label htmlFor="status" value="Status *" /><Select id="status" name="status" value={form.status} onChange={handleChange} required><option value="">Pilih Status</option><option value="Aktif">Aktif</option><option value="Tidak Aktif">Tidak Aktif</option></Select></div>
      <div><Label htmlFor="old_inventory_code" value="Kode Inventaris Lama" /><TextInput id="old_inventory_code" name="old_inventory_code" value={form.old_inventory_code} onChange={handleChange} /></div>
      <div>
        <Label htmlFor="image_file" value="Upload Gambar" />
        <FileInput accept="image/*" onChange={handleImage} />
        {previewUrl && <img src={previewUrl} className="h-32 mt-2 object-contain border rounded" />}
      </div>
      <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Submit</button>
    </form>
  );
}
