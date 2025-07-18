import { useEffect, useState } from "react";
import api from '../../utils/api';
import { Table, Button } from "flowbite-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";

interface NullableTime {
  Time: string;
  Valid: boolean;
}

interface Vendor {
  vendor_id: string;
  nama_vendor: string;
  alamat: string;
  status: string;
  id: number;
  created_at: string;
  created_by: string;
  updated_at: NullableTime | null;
  updated_by: string | null;
  deleted_at: NullableTime | null;
  deleted_by: string | null;
}

export default function VendorList() {
  const [data, setData] = useState<Vendor[]>([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const hardcodedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWRtaW4tdGVzdCIsIm5hbWUiOiJBZG1pbiIsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJyb2xlX2lkIjoiMTIzNDUifQ.Slightly_Different_Dummy_Token_For_Frontend_Dev";
  const currentToken = token || hardcodedToken;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<{data: any[], message: string}>("/vendor", {
          headers: { Authorization: `Bearer ${currentToken}` },
        });

        const getStringValue = (val: any): string => {
            if (typeof val === 'object' && val !== null && 'String' in val && val.Valid) {
                return val.String;
            } else if (typeof val === 'string') {
                return val;
            }
            return "";
        };

        const getEnumValue = (val: any): string => {
            if (typeof val === 'string') {
                return val;
            } else if (typeof val === 'object' && val !== null) {
                return String(val);
            }
            return "";
        };

        const transformedData: Vendor[] = res.data.data.map((item: any) => {
            return {
                id: item.id,
                vendor_id: item.vendor_id,
                nama_vendor: getStringValue(item.nama_vendor),
                alamat: getStringValue(item.alamat),
                status: getEnumValue(item.status),
                created_at: item.created_at,
                created_by: item.created_by,
                updated_at: item.updated_at || null,
                updated_by: getStringValue(item.updated_by) || null,
                deleted_at: item.deleted_at || null,
                deleted_by: getStringValue(item.deleted_by) || null,
            };
        });

        setData(transformedData);
        console.log("Fetched Vendor Data (Transformed):", transformedData);

        if (transformedData.length === 0) {
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
    if (currentToken) {
        fetchData();
    } else {
        console.warn("No authentication token found. Fetch skipped.");
        toast.error("Token autentikasi tidak ditemukan. Fetch data dibatalkan.");
    }
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
                        <Table.Cell>{item.nama_vendor || "-"}</Table.Cell>
                        <Table.Cell>{item.alamat || "-"}</Table.Cell>
                        <Table.Cell>{item.status || "-"}</Table.Cell>
                    </Table.Row>
                ))
            )}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}
