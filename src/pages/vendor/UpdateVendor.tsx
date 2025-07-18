import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from '../../utils/api';
import { TextInput, Label, Button, Select } from "flowbite-react";
import { toast } from "react-toastify";

interface Vendor {
  vendor_id: string;
  nama_vendor: string;
  alamat: string;
  status: string;
}

export default function UpdateVendor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState<Vendor>({
    vendor_id: "",
    nama_vendor: "",
    alamat: "",
    status: "Aktif",
  });

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const res = await api.get(`/vendor/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForm(res.data.data);
      } catch {
        toast.error("Gagal memuat data vendor.");
      }
    };
    fetchVendor();
  }, [id, token]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.put(
        `/vendor/${id}`,
        {
          ...form,
          updated_by: "admin", // sesuaikan dengan user login jika tersedia
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Vendor berhasil diperbarui.");
      navigate(`/vendor/${id}`);
    } catch {
      toast.error("Gagal memperbarui vendor.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Data Vendor</h1>

      <div>
        <Label htmlFor="nama_vendor" value="Nama Vendor *" />
        <TextInput
          id="nama_vendor"
          name="nama_vendor"
          value={form.nama_vendor}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="alamat" value="Alamat *" />
        <TextInput
          id="alamat"
          name="alamat"
          value={form.alamat}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="status" value="Status *" />
        <Select id="status" name="status" value={form.status} onChange={handleChange} required>
          <option value="Aktif">Aktif</option>
          <option value="Tidak Aktif">Tidak Aktif</option>
        </Select>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Submit</button>
      </div>
    </form>
  );
}
