import { useEffect, useState } from "react";
import api from '../../utils/api';
import { Card } from "flowbite-react";
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
  nama_vendor: SqlNullString;
  alamat: SqlNullString;
  status: any;
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


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Daftar Vendor</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-10">
            Tidak ada data vendor yang tersedia.
          </div>
        ) : (
          data.map((item, index) => {
            console.log(`Mapping item ${index} for Card:`, item);
            return (
              <Card 
                key={item.vendor_id} 
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => navigate(`/vendor/${item.vendor_id}`)} // Navigate ke detail vendor
              >
                <h2 className="text-lg font-semibold mb-2">
                    {item.nama_vendor?.Valid ? item.nama_vendor.String : "Nama Vendor Tidak Tersedia"}
                </h2>
                <p className="text-sm text-gray-600">
                    <strong>ID Vendor:</strong> {item.vendor_id}
                </p>
                <p className="text-sm text-gray-600">
                    <strong>Alamat:</strong> {item.alamat?.Valid ? item.alamat.String : "-"}
                </p>
                <p className="text-sm text-gray-600">
                    <strong>Status:</strong> {decodeEnum(item.status) || "-"}
                </p>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
