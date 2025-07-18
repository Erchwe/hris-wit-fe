import { useState, useEffect } from "react";
import api from '../../utils/api.ts';
import { Button, Label, Textarea, Modal, Select } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface SqlNullString {
  String: string;
  Valid: boolean;
}

interface AvailableInventaris {
  inventaris_id: string;
  nama_inventaris: string;
  status: string;
  keterangan: SqlNullString;
}

interface OverduePeminjaman {
  peminjaman_id: string;
  nama_inventaris: string;
  tanggal_kembali: string;
  tanggal_pinjam: string;
  status_peminjaman: string;
}


export default function AjukanPeminjamanPage() {
  const navigate = useNavigate();

  const [selectedInventarisId, setSelectedInventarisId] = useState<string | null>(null);
  const [tanggalMulai, setTanggalMulai] = useState<string>("");
  const [tanggalKembali, setTanggalKembali] = useState<string>("");
  const [catatan, setCatatan] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- HARDCODED TOKEN UNTUK PENGEMBANGAN ---
  const hardcodedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWRtaW4tdGVzdCIsIm5hbWUiOiJBZG1pbiIsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJyb2xlX2lkIjoiMTIzNDUifQ.Slightly_Different_Dummy_Token_For_Frontend_Dev";
  const token = localStorage.getItem("token") || hardcodedToken;
  // --- AKHIR HARDCODED TOKEN ---

  const [availableInventarisList, setAvailableInventarisList] = useState<AvailableInventaris[]>([]);
  const [overduePeminjamanList, setOverduePeminjamanList] = useState<OverduePeminjaman[]>([]);
  const [loadingInventaris, setLoadingInventaris] = useState(true);
  const [loadingOverdue, setLoadingOverdue] = useState(true);

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
    const fetchAvailableInventaris = async () => {
      try {
        setLoadingInventaris(true);
        const response = await api.get<{data: AvailableInventaris[], message: string}>("/peminjaman/available-inventaris", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const transformedData = response.data.data.map((item: any) => ({
            ...item,
            keterangan: item.keterangan.Valid ? item.keterangan.String : '',
        }));
        setAvailableInventarisList(transformedData);
      } catch (err) {
        toast.error("Gagal memuat daftar inventaris tersedia.");
        console.error("Failed to fetch available inventaris:", err);
      } finally {
        setLoadingInventaris(false);
      }
    };
    if (token) {
      fetchAvailableInventaris();
    }
  }, [token]);

  useEffect(() => {
    const fetchOverduePeminjaman = async () => {
      try {
        setLoadingOverdue(true);
        const response = await api.get<{data: OverduePeminjaman[], message: string}>("/peminjaman/my-overdue", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOverduePeminjamanList(response.data.data);
      } catch (err) {
        toast.error("Gagal memuat notifikasi pengembalian.");
        console.error("Failed to fetch overdue peminjaman:", err);
      } finally {
        setLoadingOverdue(false);
      }
    };
    if (token) {
      fetchOverduePeminjaman();
    }
  }, [token]);

  const handleSubmit = async () => {
    if (!selectedInventarisId || !tanggalMulai || !tanggalKembali) {
      toast.error("Mohon lengkapi semua data peminjaman (inventaris, tanggal mulai, tanggal kembali).");
      return;
    }

    if (new Date(tanggalMulai) > new Date(tanggalKembali)) {
        toast.error("Tanggal kembali tidak boleh mendahului tanggal mulai.");
        return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/peminjaman", {
        inventaris_id: selectedInventarisId,
        tgl_pinjam: tanggalMulai,
        tgl_kembali: tanggalKembali,
        notes: catatan,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Peminjaman berhasil diajukan! Menunggu persetujuan.");
      navigate("/peminjaman");
    } catch (err: any) {
        console.error("Failed to submit peminjaman:", err);
        const errorMessage = err.response?.data?.message || "Gagal mengajukan peminjaman.";
        toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnInventaris = async (peminjamanId: string) => {
    setIsSubmitting(true);
    try {
        await api.put(`/peminjaman/${peminjamanId}`, {
            tgl_pinjam: overduePeminjamanList.find(item => item.peminjaman_id === peminjamanId)?.tanggal_pinjam,
            tgl_kembali: new Date().toISOString().split('T')[0],
            status_peminjaman: "Tidak Dipinjam",
            notes: overduePeminjamanList.find(item => item.peminjaman_id === peminjamanId)?.status_peminjaman + " - Dikembalikan",
            updated_by: "system"
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Inventaris berhasil dikembalikan!");
        setOverduePeminjamanList(prev => prev.filter(item => item.peminjaman_id !== peminjamanId));
    } catch (err) {
        console.error("Failed to return inventaris:", err);
        toast.error("Gagal mengembalikan inventaris.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const selectedInventarisName = availableInventarisList.find((i) => i.inventaris_id === selectedInventarisId)?.nama_inventaris;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Ajukan Peminjaman</h1>

      <Button color="warning" onClick={() => setShowModal(true)}>Lihat Notifikasi Pengembalian ({overduePeminjamanList.length})</Button>

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>Notifikasi Pengembalian</Modal.Header>
        <Modal.Body>
          {loadingOverdue ? (
            <p className="text-gray-500">Memuat notifikasi...</p>
          ) : overduePeminjamanList.length === 0 ? (
            <p>Tidak ada peminjaman yang terlambat.</p>
          ) : (
            <ul className="space-y-2">
              {overduePeminjamanList.map((item) => (
                <li key={item.peminjaman_id} className="border p-3 rounded">
                  <p><strong>{item.nama_inventaris}</strong></p>
                  <p className="text-sm text-red-600">Terlambat dikembalikan (seharusnya: {formatDate(item.tanggal_kembali)})</p>
                  <Button size="xs" className="mt-2" onClick={() => handleReturnInventaris(item.peminjaman_id)} disabled={isSubmitting}>Kembalikan Sekarang</Button>
                </li>
              ))}
            </ul>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowModal(false)}>Tutup</Button>
        </Modal.Footer>
      </Modal>

      {!selectedInventarisId ? (
        <div className="space-y-3">
          <Label value="Pilih Barang untuk Dipinjam" className="mb-2" />
          {loadingInventaris ? (
            <p className="text-gray-500">Memuat daftar inventaris...</p>
          ) : availableInventarisList.length === 0 ? (
            <p className="text-gray-600">Tidak ada inventaris yang tersedia saat ini.</p>
          ) : (
            <Select id="inventaris" required value={selectedInventarisId || ""} onChange={(e) => setSelectedInventarisId(e.target.value)}>
                <option value="">Pilih Inventaris</option>
                {availableInventarisList.map(item => (
                    <option key={item.inventaris_id} value={item.inventaris_id}>
                        {item.nama_inventaris}
                    </option>
                ))}
            </Select>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Barang: <span className="font-semibold">{selectedInventarisName}</span>
          </p>

          <div>
            <Label htmlFor="tanggalMulai" value="Tanggal Mulai Peminjaman" />
            <input
              type="date"
              id="tanggalMulai"
              className="w-full border rounded px-3 py-2"
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="tanggalKembali" value="Tanggal Pengembalian" />
            <input
              type="date"
              id="tanggalKembali"
              className="w-full border rounded px-3 py-2"
              value={tanggalKembali}
              onChange={(e) => setTanggalKembali(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="catatan" value="Catatan Tambahan" />
            <Textarea id="catatan" value={catatan} onChange={(e) => setCatatan(e.target.value)} />
          </div>

          <div className="flex gap-4">
            <Button color="gray" onClick={() => setSelectedInventarisId(null)}>Batal</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Mengajukan..." : "Ajukan Sekarang"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}