import { useEffect, useState } from "react";
import api from '../../utils/api';
import { Card } from "flowbite-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Helper interfaces for Go's sql.NullString and sql.NullTime JSON output
interface SqlNullString {
  String: string;
  Valid: boolean;
}

interface NullableTime {
  Time: string;
  Valid: boolean;
}

// Helper to decode Base64 enum values
const decodeEnum = (data: any): string => {
  let valueToDecode = '';
  if (typeof data === 'string') valueToDecode = data;
  else if (data?.Valid && typeof data.String === 'string') valueToDecode = data.String;

  if (valueToDecode) {
    try { return atob(valueToDecode); } catch (e) { return valueToDecode; }
  }
  return '';
};

// Inventaris interface to match backend JSON response
interface Inventaris {
  inventaris_id: string;
  nama_inventaris: string;
  tanggal_beli: string;
  harga: number;
  image_url?: SqlNullString | null;

  brand_id: string;
  nama_brand: SqlNullString | null;

  vendor_id: string;
  nama_vendor: SqlNullString | null;

  kategori_id: string;
  nama_kategori: SqlNullString | null;

  ruangan_id: string;
  nama_ruangan: SqlNullString | null;

  id: number;
  jumlah: number;
  keterangan: SqlNullString | null;
  old_inventory_code: SqlNullString | null;
  status: string;
  created_at: string;
  created_by: string;
  updated_at: NullableTime | null;
  updated_by: SqlNullString | null;
  deleted_at: NullableTime | null;
  deleted_by: SqlNullString | null;
}

export default function InventoryList() {
  const [data, setData] = useState<Inventaris[]>([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Hardcoded token for development. Remove/adjust in production.
  const currentToken = token || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWRtaW4tdGVzdCIsIm5hbWUiOiJBZG1pbiIsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJyb2xlX2lkIjoiMTIzNDUifQ.Slightly_Different_Dummy_Token_For_Frontend_Dev";

  // Helper for date formatting
  const formatDate = (dateString: string): string => {
    try {
      const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('id-ID', options).replace(/ /g, '-');
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<{data: Inventaris[], message: string}>("/inventaris/with-relations", {
          headers: { Authorization: `Bearer ${currentToken}` },
        });

        setData(res.data.data); // Set data directly as interfaces match JSON
        console.log("Fetched Inventory Data:", res.data.data); // Log raw fetched data

        if (res.data.data.length === 0) {
            toast.info("Tidak ada data inventaris.");
        }
      } catch (error) {
        console.error("Failed to load inventory data:", error);
        toast.error("Gagal memuat data inventory.");
      }
    };
    fetchData();
  }, [currentToken]);

  console.log("Rendering InventoryList. Data length:", data.length);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Daftar Inventaris</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-10">
            Tidak ada data inventaris yang tersedia.
          </div>
        ) : (
          data.map((item) => (
            <Card 
              key={item.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => navigate(`/inventaris/with-relations/${item.inventaris_id}`)}
            >
              <h2 className="text-lg font-semibold mb-2">
                  {item.nama_inventaris || "Nama Inventaris Tidak Tersedia"}
              </h2>
              <p className="text-sm text-gray-600">
                  <strong>ID:</strong> {item.inventaris_id}
              </p>
              {item.nama_brand?.Valid && ( // Access Valid and String for NullString
                  <p className="text-sm text-gray-600">
                      <strong>Brand:</strong> {item.nama_brand.String}
                  </p>
              )}
              {item.nama_vendor?.Valid && ( // Access Valid and String for NullString
                  <p className="text-sm text-gray-600">
                      <strong>Vendor:</strong> {item.nama_vendor.String}
                  </p>
              )}
              {item.nama_ruangan?.Valid && ( // Access Valid and String for NullString
                  <p className="text-sm text-gray-600">
                      <strong>Ruangan:</strong> {item.nama_ruangan.String}
                  </p>
              )}
              <p className="text-sm text-gray-600">
                  <strong>Tanggal Beli:</strong> {formatDate(item.tanggal_beli)}
              </p>
              <p className="text-sm text-gray-600">
                  <strong>Harga:</strong> Rp {item.harga.toLocaleString('id-ID')}
              </p>
              <p className="text-sm text-gray-600">
                  <strong>Status:</strong> {decodeEnum(item.status) || "-"}
              </p>

              {item.image_url?.Valid && ( // Akses Valid dan String untuk NullString
                  <div className="mt-2">
                      <img src={item.image_url.String} className="h-24 object-contain rounded" />
                  </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
