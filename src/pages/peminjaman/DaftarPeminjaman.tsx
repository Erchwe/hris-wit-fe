import { useEffect, useState } from "react";
import { Card, Badge } from "flowbite-react";
import api from '../../utils/api.ts';
import { toast } from "react-toastify";

interface Peminjaman {
  peminjaman_id: string;
  nama_inventaris: string;
  tanggal_pinjam: string;
  tanggal_kembali: string;
  status_peminjaman: string;
  notes: string;
}

export default function DaftarPeminjamanPage() {
  const [peminjamanList, setPeminjamanList] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- HARDCODED TOKEN UNTUK PENGEMBANGAN ---
  const hardcodedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWRtaW4tdGVzdCIsIm5hbWUiOiJBZG1pbiIsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJyb2xlX2lkIjoiMTIzNDUifQ.Slightly_Different_Dummy_Token_For_Frontend_Dev";
  const token = localStorage.getItem("token") || hardcodedToken;
  // --- AKHIR HARDCODED TOKEN ---

  const formatDate = (dateString: string): string => {
    try {
      const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-GB', options).replace(/ /g, '-');
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  const getStatusColor = (status: string): 'info' | 'success' | 'warning' | 'failure' | 'gray' => {
    switch (status) {
      case "Sedang Dipinjam":
        return "info";
      case "Tidak Dipinjam":
        return "success";
      case "Menunggu Persetujuan":
        return "warning";
      default:
        return "gray";
    }
  };

  useEffect(() => {
    const fetchMyPeminjaman = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get<{data: Peminjaman[], message: string}>("/peminjaman/my-list", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        const transformedData = response.data.data.map((item: any) => ({
            ...item,
            nama_inventaris: item.nama_inventaris.Valid ? item.nama_inventaris.String : item.nama_inventaris,
            notes: item.notes.Valid ? item.notes.String : item.notes,
        }));
        setPeminjamanList(transformedData);

      } catch (err) {
        console.error("Failed to fetch my peminjaman list:", err);
        toast.error("Gagal memuat daftar peminjaman.");
        setError("Gagal memuat daftar peminjaman.");
      } finally {
        setLoading(false);
      }
    };

    // Kondisi ini sekarang akan selalu true karena hardcodedToken
    if (token) {
      fetchMyPeminjaman();
    } else {
      setLoading(false);
      setError("Token otentikasi tidak ditemukan. Silakan login kembali.");
      toast.error("Anda tidak terautentikasi. Silakan login.");
    }
  }, [token]);

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center text-gray-500">
        Memuat daftar peminjaman...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Daftar Peminjaman Saya</h1>
      <div className="space-y-4">
        {peminjamanList.length === 0 ? (
          <p className="text-gray-600">Anda belum memiliki riwayat peminjaman.</p>
        ) : (
          peminjamanList.map((item) => (
            <Card key={item.peminjaman_id}>
              <h2 className="text-lg font-semibold">{item.nama_inventaris || "-"}</h2>
              <p><strong>Mulai:</strong> {formatDate(item.tanggal_pinjam)}</p>
              <p><strong>Kembali:</strong> {formatDate(item.tanggal_kembali)}</p>
              <p><strong>Status:</strong> <Badge color={getStatusColor(item.status_peminjaman)}>{item.status_peminjaman}</Badge></p>
              <p><strong>Catatan:</strong> {item.notes || "-"}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}