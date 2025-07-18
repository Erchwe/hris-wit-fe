import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from '../../utils/api';
import { Button, Card } from "flowbite-react";
import { toast } from "react-toastify";

interface Vendor {
  vendor_id: string;
  nama_vendor: string;
  alamat: string;
  status: string;
}

export default function VendorDetail() {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/vendor/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVendor(res.data.data);
      } catch (error) {
        toast.error("Gagal mengambil data vendor");
      }
    };
    fetchDetail();
  }, [id, token]);

  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus vendor ini?")) return;
    try {
      await api.delete(`/vendor-kontak/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Vendor berhasil dihapus");
      navigate("/vendor");
    } catch {
      toast.error("Gagal menghapus vendor");
    }
  };

  if (!vendor) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <Card>
        <h1 className="text-2xl font-bold mb-4">Detail Vendor</h1>
        <div className="space-y-2">
          <p><strong>Nama:</strong> {vendor.nama_vendor}</p>
          <p><strong>Alamat:</strong> {vendor.alamat}</p>
          <p><strong>Status:</strong> {vendor.status}</p>
        </div>
        <div className="flex gap-4 mt-6">
          {/* Tombol Edit */}
          <button 
              type="button" // Type button untuk mencegah submit form jika berada dalam form
              onClick={() => navigate(`/inventaris/update/${data.inventaris_id}`)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" // Gaya Tailwind CSS
          >
              Edit
          </button>
          
          {/* Tombol Delete */}
          <button 
              type="button" // Type button untuk mencegah submit form jika berada dalam form
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2" // Gaya Tailwind CSS, tambah margin kiri
          >
              Delete
          </button>
        </div>
      </Card>
    </div>
  );
}
