import { useEffect, useState } from "react";
import api from '../../utils/api';
import { Table, Button } from "flowbite-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Interface untuk SqlNullString dari Proyek.tsx
interface SqlNullString {
  String: string;
  Valid: boolean;
}

// Interface untuk NullableTime dari Proyek.tsx
interface NullableTime {
  Time: string;
  Valid: boolean;
}

// Interface Vendor disesuaikan dengan pola Proyek.tsx
interface Vendor {
  vendor_id: string;
  nama_vendor: SqlNullString; // Jika nama_vendor bisa NULL
  alamat: SqlNullString;      // Jika alamat bisa NULL
  status: any;                // Untuk ENUM, gunakan 'any' atau buat interface lebih spesifik jika perlu decode Enum
  id: number;
  created_at: string;
  created_by: string;
  updated_at: NullableTime;
  updated_by: SqlNullString;
  deleted_at: NullableTime;
  deleted_by: SqlNullString;
  // Tambahkan field lain dari respons backend jika ada
}

// Gunakan fungsi decodeEnum dari Proyek.tsx
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

  const currentToken = token || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWRtaW4tdGVzdCIsIm5hbWUiOiJBZG1pbiIsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJyb2xlX2lkIjoiMTIzNDUifQ.Slightly_Different_Dummy_Token_For_Frontend_Dev";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<{data: Vendor[], message: string}>("/vendor", { // Tipekan res.data.data langsung ke Vendor[]
          headers: { Authorization: `Bearer ${currentToken}` },
        });

        setData(res.data.data); // Hapus transformasi .map() jika interface sudah cocok
        console.log("Fetched Vendor Data:", res.data.data); // Log data mentah

        if (res.data.data.length === 0) {
            toast.info("Tidak ada data vendor.");
        }
      } catch (error) {
        console.error("Gagal memuat data vendor:", error);
        toast.error("Gagal memuat data vendor.");
        if (axios.isAxiosError(error) && error.response) {
            console.error("Error Response Data:", error.response.data);
            console.error("Error Response Status:", error.response.status);
        }
      }
    };
    fetchData();
  }, [currentToken]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Daftar Vendor</h1>
      <div className="overflow-x-auto">
        <Table>
          <Table.Head>
            <Table.HeadCell>Nama Vendor</Table.HeadCell>
            <Table.HeadCell>Alamat</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {data.length === 0 ? (
                <Table.Row>
                    <Table.Cell colSpan={3} className="text-center text-gray-500">Tidak ada data vendor yang tersedia.</Table.Cell>
                </Table.Row>
            ) : (
                data.map((item) => (
                    <Table.Row
                        key={item.vendor_id}
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => navigate(`/vendor/${item.vendor_id}`)}
                    >
                        {/* Akses .String dari SqlNullString, dan decodeEnum untuk status */}
                        <Table.Cell>{item.nama_vendor?.String || "-"}</Table.Cell>
                        <Table.Cell>{item.alamat?.String || "-"}</Table.Cell>
                        <Table.Cell>{decodeEnum(item.status) || "-"}</Table.Cell>
                    </Table.Row>
                ))
            )}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}
