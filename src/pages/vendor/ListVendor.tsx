import { useEffect, useState } from "react";
import api from '../../utils/api';
import { Card } from "flowbite-react"; // Import Card
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";

// Helper interfaces for Go's sql.NullString and sql.NullTime JSON output
interface SqlNullString {
  String: string;
  Valid: boolean;
}

interface NullableTime {
  Time: string;
  Valid: boolean;
}

// Vendor interface to match backend JSON response
interface Vendor {
  vendor_id: string;
  nama_vendor: string; // Plain string from backend
  alamat: string;      // Plain string from backend
  status: string;      // Plain string from backend (after decodeEnum)
  id: number;
  created_at: string;
  created_by: string;
  updated_at: NullableTime | null;
  updated_by: SqlNullString | null;
  deleted_at: NullableTime | null;
  deleted_by: SqlNullString | null;
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

export default function VendorList() {
  const [data, setData] = useState<Vendor[]>([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Hardcoded token for development. Remove/adjust in production.
  const currentToken = token || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWRtaW4tdGVzdCIsIm5hbWUiOiJBZG1pbiIsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJyb2xlX2lkIjoiMTIzNDUifQ.Slightly_Different_Dummy_Token_For_Frontend_Dev";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<{data: Vendor[], message: string}>("/vendor", {
          headers: { Authorization: `Bearer ${currentToken}` },
        });

        setData(res.data.data); // Data is set directly as interfaces match JSON
        console.log("Fetched Vendor Data:", res.data.data); // Log raw fetched data

        if (res.data.data.length === 0) {
            toast.info("Tidak ada data vendor.");
        }
      } catch (error) {
        console.error("Failed to load vendor data:", error);
        toast.error("Gagal memuat data vendor.");
        if ((error as AxiosError).isAxiosError && (error as AxiosError).response) {
            console.error("Error Response Data:", (error as AxiosError).response?.data);
        }
      }
    };
    fetchData();
  }, [currentToken]);

  console.log("Rendering VendorList. Data length:", data.length);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Daftar Vendor</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-10">
            Tidak ada data vendor yang tersedia.
          </div>
        ) : (
          data.map((item) => (
            <Card 
              key={item.vendor_id} 
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => navigate(`/vendor/${item.vendor_id}`)}
            >
              <h2 className="text-lg font-semibold mb-2">
                  {item.nama_vendor || "Nama Vendor Tidak Tersedia"} {/* Access directly as string */}
              </h2>
              <p className="text-sm text-gray-600">
                  <strong>ID Vendor:</strong> {item.vendor_id}
              </p>
              <p className="text-sm text-gray-600">
                  <strong>Alamat:</strong> {item.alamat || "-"} {/* Access directly as string */}
              </p>
              <p className="text-sm text-gray-600">
                  <strong>Status:</strong> {decodeEnum(item.status) || "-"} {/* Decode enum */}
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
