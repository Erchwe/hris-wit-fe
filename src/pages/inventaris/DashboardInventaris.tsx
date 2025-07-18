import { Card } from "flowbite-react";
import { Badge } from "flowbite-react";
import Chart from "react-apexcharts";
import { useEffect, useState } from "react";
import api from '../../utils/api.ts';
import { toast } from "react-toastify";

// Definisi Interface untuk struktur data dari backend
interface DashboardStats {
  total_inventaris: number;
  sedang_dipinjam: number;
  tersedia: number;
  rusak_maintenance: number;
}

// Representasi struktur JSON untuk sql.NullString dari Go
interface SqlNullString {
  String: string;
  Valid: boolean;
}

interface RecentActivity {
  peminjaman_id: string;
  nama_inventaris: SqlNullString;
  tanggal_pinjam: string;
  tanggal_kembali: string;
  status_display: string;
  nama_peminjam: SqlNullString;
}

interface RecentPeminjam {
  user_id: string;
  nama_peminjam: SqlNullString;
  tanggal_terakhir_pinjam: string;
}

interface NotReturnedInventaris {
  peminjaman_id: string;
  nama_inventaris: string;
  tanggal_pinjam: string;
  tanggal_kembali_rencana: string;
  nama_peminjam: SqlNullString;
}

interface NewVendor {
  vendor_id: string;
  nama_vendor: string;
  kontak_vendor: SqlNullString;
  jenis_kontak: SqlNullString;
  created_at: string;
}

// Struktur utama respons data dashboard dari backend
interface DashboardData {
  stats: DashboardStats;
  recent_activities: RecentActivity[];
  recent_peminjam: RecentPeminjam[];
  not_returned: NotReturnedInventaris[];
  new_vendors: NewVendor[];
}

export default function DashboardInventaris() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bagian hardcoded token untuk pengembangan. Hapus/sesuaikan di produksi.
  const hardcodedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWRtaW4tdGVzdCIsIm5hbWUiOiJBZG1pbiIsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJyb2xlX2lkIjoiMTIzNDUifQ.Slightly_Different_Dummy_Token_For_Frontend_Dev";
  const token = localStorage.getItem("token") || hardcodedToken;

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "-";
    try {
      const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-GB', options).replace(/ /g, '-');
    } catch (e) {
      console.error("Error formatting date:", e); // Log error untuk debugging
      return "-";
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get<{data: DashboardData, message: string}>("/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Mengakses response.data.data sesuai struktur JSON backend
        setDashboardData(response.data.data); 
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err); // Log error untuk debugging
        toast.error("Gagal memuat data dashboard.");
        setError("Gagal memuat data dashboard.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    } else {
      setLoading(false);
      setError("Token otentikasi tidak ditemukan. Silakan login kembali.");
      toast.error("Anda tidak terautentikasi. Silakan login.");
    }
  }, [token]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Memuat data dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  // Pengecekan data dashboard dan stats agar tidak undefined saat rendering
  if (!dashboardData || !dashboardData.stats) { 
    return (
      <div className="p-6 text-center text-gray-500">
        Tidak ada data dashboard yang tersedia atau struktur data tidak lengkap.
      </div>
    );
  }

  const chartSeries = [
    dashboardData.stats.tersedia,
    dashboardData.stats.sedang_dipinjam,
    dashboardData.stats.rusak_maintenance
  ];

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "donut" as const,
      toolbar: { show: false },
    },
    labels: ["Tersedia", "Dipinjam", "Rusak"],
    colors: ["#10b981", "#3b82f6", "#f59e0b"],
    legend: { position: "bottom" as const },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">Dashboard Inventaris</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <p className="text-sm text-gray-500">Total Inventaris</p>
          <p className="text-2xl font-bold">{dashboardData.stats.total_inventaris}</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-sm text-gray-500">Sedang Dipinjam</p>
          <p className="text-2xl font-bold">{dashboardData.stats.sedang_dipinjam}</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-sm text-gray-500">Tersedia</p>
          <p className="text-2xl font-bold">{dashboardData.stats.tersedia}</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-sm text-gray-500">Rusak / Maintenance</p>
          <p className="text-2xl font-bold">{dashboardData.stats.rusak_maintenance}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-2">Distribusi Kondisi</h2>
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="donut"
            height={300}
          />
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">5 Aktivitas Terbaru</h2>
          <ul className="space-y-3">
            {dashboardData.recent_activities.length > 0 ? (
              dashboardData.recent_activities.map((act, i) => (
                <li
                  key={act.peminjaman_id || i}
                  className="flex justify-between border-b pb-2 text-sm"
                >
                  {/* Mengakses nilai String dari SqlNullString */}
                  <span>{act.nama_inventaris.Valid ? act.nama_inventaris.String : "-"}</span>
                  <div className="flex items-center space-x-2">
                    <Badge color={act.status_display === "Dipinjam" ? "warning" : "success"}>
                      {act.status_display}
                    </Badge>
                    <span className="text-gray-500 text-xs">
                        {formatDate(act.tanggal_pinjam)}
                        {act.status_display === "Dikembalikan" && act.tanggal_kembali ? ` (Kembali: ${formatDate(act.tanggal_kembali)})` : ''}
                    </span>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-sm text-gray-500">Tidak ada aktivitas terbaru.</p>
            )}
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-3">Peminjam Terbaru</h2>
          <ul className="space-y-2 text-sm">
            {dashboardData.recent_peminjam.length > 0 ? (
              dashboardData.recent_peminjam.map((p, i) => (
                <li key={p.user_id || i} className="flex justify-between">
                  {/* Mengakses nilai String dari SqlNullString */}
                  <span>{p.nama_peminjam.Valid ? p.nama_peminjam.String : "-"}</span>
                  <span className="text-gray-500 text-xs">{formatDate(p.tanggal_terakhir_pinjam)}</span>
                </li>
              ))
            ) : (
              <p className="text-sm text-gray-500">Tidak ada peminjam terbaru.</p>
            )}
          </ul>
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-3">Belum Dikembalikan</h2>
          <ul className="space-y-2 text-sm">
            {dashboardData.not_returned.length > 0 ? (
              dashboardData.not_returned.map((b, i) => (
                <li key={b.peminjaman_id || i} className="flex flex-col sm:flex-row justify-between">
                  <span>{b.nama_inventaris}</span>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-right sm:text-left">
                    <span className="text-red-500 text-xs">Jatuh Tempo: {formatDate(b.tanggal_kembali_rencana)}</span>
                    {/* Mengakses nilai String dari SqlNullString */}
                    <span>Peminjam: {b.nama_peminjam.Valid ? b.nama_peminjam.String : "-"}</span>
                  </div>
                </li>
              ))
            ) : (
              <p className="text-sm text-gray-500">Tidak ada inventaris yang belum dikembalikan.</p>
            )}
          </ul>
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-3">Kontak Vendor Baru</h2>
          <ul className="space-y-2 text-sm">
            {dashboardData.new_vendors.length > 0 ? (
              dashboardData.new_vendors.map((v, i) => (
                <li key={v.vendor_id || i} className="flex justify-between">
                  <span>{v.nama_vendor}</span>
                  <span className="text-gray-600 text-xs">
                    {/* Mengakses nilai String dari SqlNullString, dengan fallback */}
                    {v.kontak_vendor.Valid ? v.kontak_vendor.String : (v.jenis_kontak.Valid ? v.jenis_kontak.String : "-")}
                  </span>
                </li>
              ))
            ) : (
              <p className="text-sm text-gray-500">Tidak ada kontak vendor baru.</p>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}