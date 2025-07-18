import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from '../../utils/api.ts';
import { toast } from "react-toastify";
import { Button } from "flowbite-react";
import Swal from "sweetalert2";

interface InventarisDetail {
  inventaris_id: string;
  nama_inventaris: string;
  tanggal_beli: string;
  harga: number;
  jumlah: number;
  keterangan: string;
  old_inventory_code: string;
  status: string;
  image_url?: string;
  nama_brand?: string;
  nama_vendor?: string;
  nama_kategori?: string;
  nama_ruangan?: string;
}

export default function InventarisDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [data, setData] = useState<InventarisDetail | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/inventaris/with-relations/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const item = res.data.data;
        const cleanString = (value: any) => (value && typeof value === 'object' && 'String' in value ? value.String : value ?? "");

        const decodeStatus = (statusRaw: any) => {
          const raw = cleanString(statusRaw);
          try {
            return atob(raw);
          } catch {
            return raw;
          }
        };

        console.log("Fetched data:", item);
        setData({
          inventaris_id: cleanString(item.inventaris_id),
          nama_inventaris: cleanString(item.nama_inventaris),
          tanggal_beli: cleanString(item.tanggal_beli),
          harga: item.harga,
          jumlah: item.jumlah,
          keterangan: cleanString(item.keterangan),
          old_inventory_code: cleanString(item.old_inventory_code),
          status: decodeStatus(item.status),
          image_url: cleanString(item.image_url),
          nama_brand: cleanString(item.nama_brand),
          nama_vendor: cleanString(item.nama_vendor),
          nama_kategori: cleanString(item.nama_kategori),
          nama_ruangan: cleanString(item.nama_ruangan),
        });
      } catch {
        toast.error("Gagal memuat detail inventaris");
      }
    };

    fetchDetail();
  }, [id, token]);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Hapus inventaris?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/inventaris/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Inventaris berhasil dihapus");
        navigate("/inventaris/listinventaris");
      } catch {
        toast.error("Gagal menghapus inventaris");
      }
    }
  };

  if (!data) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Detail Inventaris</h1>
      {data.image_url && (
        <img
          src={data.image_url}
          alt="Preview"
          className="h-64 w-full object-contain border rounded mb-4"
        />
      )}
      <div className="grid grid-cols-2 gap-4">
        <p><strong>Nama:</strong> {data.nama_inventaris}</p>
        <p><strong>Brand:</strong> {data.nama_brand}</p>
        <p><strong>Tanggal Beli:</strong> {new Date(data.tanggal_beli).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}</p>
        <p><strong>Harga:</strong> Rp {data.harga.toLocaleString()}</p>
        <p><strong>Jumlah:</strong> {data.jumlah}</p>
        <p><strong>Kode Lama:</strong> {data.old_inventory_code || "-"}</p>
        <p><strong>Status:</strong> {data.status}</p>
        <p><strong>Keterangan:</strong> {data.keterangan || "-"}</p>
        <p><strong>Vendor:</strong> {data.nama_vendor || "-"}</p>
        <p><strong>Kategori:</strong> {data.nama_kategori || "-"}</p>
        <p><strong>Ruangan:</strong> {data.nama_ruangan || "-"}</p>
      </div>
      <div className="mt-6 flex gap-4">
        <Button color="blue" onClick={() => navigate(`/inventaris/update/${data.inventaris_id}`)}>Edit</Button>
        <Button color="failure" onClick={handleDelete}>Delete</Button>
      </div>
    </div>
  );
}
