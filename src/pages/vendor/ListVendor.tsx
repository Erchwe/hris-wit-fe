import { useEffect, useState } from "react";
import api from '../../utils/api';
import { Table } from "flowbite-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";

interface SqlNullString {
  String: string;
  Valid: boolean;
}

interface NullableTime {
  Time: string;
  Valid: boolean;
}

interface Vendor {
  vendor_id: string;
  nama_vendor: SqlNullString; // Diubah ke SqlNullString sesuai JSON
  alamat: SqlNullString;      // Diubah ke SqlNullString sesuai JSON
  status: any;                // Menggunakan 'any' untuk ENUMs
  id: number;
  created_at: string;
  created_by: string;
  updated_at: NullableTime | null;
  updated_by: SqlNullString | null;
  deleted_at: NullableTime | null;
  deleted_by: SqlNullString | null;
}

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
        const res = await api.get<{data: Vendor[], message: string}>("/vendor", {
          headers: { Authorization: `Bearer ${currentToken}` },
        });

        setData(res.data.data);
        console.log("Fetched Vendor Data (Raw from API):", res.data.data);

        if (res.data.data.length === 0) {
            toast.info("Tidak ada data vendor.");
        }
      } catch (error) {
        console.error("Gagal memuat data vendor:", error);
        toast.error("Gagal memuat data vendor.");
        if ((error as AxiosError).isAxiosError && (error as AxiosError).response) {
            console.error("Error Response Data:", (error as AxiosError).response?.data);
            console.error("Error Response Status:", (error as AxiosError).response?.status);
            console.error("Error Response Headers:", (error as AxiosError).response?.headers);
        }
      }
    };
    fetchData();
  }, [currentToken]);

  console.log("Rendering VendorList component. Data length:", data.length);


  // --- PERUBAHAN: Forced Render untuk item pertama ---
  const firstItem = data.length > 0 ? data[0] : null;
  // --- AKHIR PERUBAHAN ---


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Daftar Vendor</h1>

      {/* Tampilkan item pertama secara hardcode di luar tabel */}
      {firstItem && (
          <div className="mb-4 p-3 border border-blue-300 bg-blue-50 rounded-md">
              <h2 className="text-lg font-semibold text-blue-800">Uji Tampil Data Pertama:</h2>
              <p>ID: {firstItem.vendor_id}</p>
              <p>Nama: {firstItem.nama_vendor?.Valid ? firstItem.nama_vendor.String : "N/A"}</p>
              <p>Alamat: {firstItem.alamat?.Valid ? firstItem.alamat.String : "N/A"}</p>
              <p>Status: {decodeEnum(firstItem.status) || "N/A"}</p>
          </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <Table.Head>
            <Table.HeadCell>Nama Vendor</Table.HeadCell>
            <Table.HeadCell>Alamat</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {console.log("Inside Table.Body. Current data length:", data.length)}
            {data.length === 0 ? (
                <Table.Row>
                    <Table.Cell colSpan={3} className="text-center text-gray-500">Tidak ada data vendor yang tersedia.</Table.Cell>
                </Table.Row>
            ) : (
                data.map((item, index) => (
                    console.log(`Mapping item ${index}:`, item),
                    <Table.Row
                        key={item.vendor_id}
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => navigate(`/vendor/${item.vendor_id}`)}
                    >
                        {/* AKSES DENGAN .Valid ? .String : "-" sesuai pola DashboardInventaris */}
                        <Table.Cell>{item.nama_vendor?.Valid ? item.nama_vendor.String : "-"}</Table.Cell>
                        <Table.Cell>{item.alamat?.Valid ? item.alamat.String : "-"}</Table.Cell>
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
