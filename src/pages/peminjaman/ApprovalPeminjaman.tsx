import { useState, useEffect } from "react";
import { Button, Card } from "flowbite-react";
import api from '../../utils/api.ts';
import { toast } from "react-toastify";

interface PendingPeminjaman {
  peminjaman_id: string;
  nama_inventaris: string;
  nama_peminjam: string | null; 
  user_id_peminjam: string;
  tanggal_pinjam: string;
  tanggal_kembali: string; 
  notes: string | null; 
}

export default function ApprovalPeminjamanPage() {
  const [pengajuanList, setPengajuanList] = useState<PendingPeminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const token = localStorage.getItem("token");

  const formatDate = (dateString: string): string => {
    try {
      const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-GB', options).replace(/ /g, '-');
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  useEffect(() => {
    const fetchPendingPeminjaman = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get<{data: PendingPeminjaman[], message: string}>("/peminjaman/approval/pending", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const transformedData = response.data.data.map((item: any) => ({
            ...item,
            nama_peminjam: item.nama_peminjam.Valid ? item.nama_peminjam.String : null,
            notes: item.notes.Valid ? item.notes.String : null,
        }));
        setPengajuanList(transformedData);

      } catch (err) {
        console.error("Failed to fetch pending peminjaman:", err);
        toast.error("Gagal memuat daftar pengajuan peminjaman.");
        setError("Gagal memuat daftar pengajuan.");
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchPendingPeminjaman();
    }
  }, [token]);

  const handleApproval = async (id: string, status: "approve" | "reject") => {
    setIsProcessing(id);
    const endpoint = status === "approve" ? `/peminjaman/approval/${id}/approve` : `/peminjaman/approval/${id}/reject`;
    const actionText = status === "approve" ? "menyetujui" : "menolak";

    try {
      await api.post(
        `${endpoint}`,
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Peminjaman berhasil ${actionText}.`);
      setPengajuanList((prev) => prev.filter((item) => item.peminjaman_id !== id));
    } catch (err: any) {
      console.error(`Failed to ${actionText} peminjaman:`, err);
      const errorMessage = err.response?.data?.message || `Gagal ${actionText} peminjaman.`;
      toast.error(errorMessage);
    } finally {
      setIsProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center text-gray-500">
        Memuat pengajuan peminjaman...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Persetujuan Peminjaman</h1>
      {pengajuanList.length === 0 ? (
        <p className="text-gray-600">Tidak ada pengajuan peminjaman saat ini.</p>
      ) : (
        pengajuanList.map((item) => (
          <Card key={item.peminjaman_id} className="border rounded p-4 space-y-2">
            <p><strong>{item.nama_inventaris}</strong></p>
            <p className="text-sm">Diajukan oleh: {item.nama_peminjam || "N/A"}</p>
            <p className="text-sm">Mulai: {formatDate(item.tanggal_pinjam)}</p>
            <p className="text-sm">Kembali: {formatDate(item.tanggal_kembali)}</p>
            <p className="text-sm italic">Catatan: {item.notes || "-"}</p>
            <div className="flex gap-4 pt-2">
              <Button 
                color="success" 
                onClick={() => handleApproval(item.peminjaman_id, "approve")}
                disabled={isProcessing === item.peminjaman_id}
              >
                {isProcessing === item.peminjaman_id ? "Memproses..." : "Setujui"}
              </Button>
              <Button 
                color="failure" 
                onClick={() => handleApproval(item.peminjaman_id, "reject")}
                disabled={isProcessing === item.peminjaman_id}
              >
                {isProcessing === item.peminjaman_id ? "Memproses..." : "Tolak"}
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}