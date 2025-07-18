import { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button } from "flowbite-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import jsPDF from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';

interface AutoTableDidDrawPageHookData {
    pageNumber: number;
    pageCount: number;
    settings: any;
    cursor: { x: number; y: number };
    table: any;
}

interface SqlNullString {
  String: string;
  Valid: boolean;
}

interface NullableTime {
  Time: string;
  Valid: boolean;
}

// Interface Inventaris yang lebih robust
interface Inventaris {
  inventaris_id: string;
  nama_inventaris: string;
  tanggal_beli: string;
  harga: number;
  image_url?: string | null; // Setelah transformasi

  brand_id: string;
  nama_brand: string | null; // Setelah transformasi

  vendor_id: string;
  nama_vendor: string | null; // Setelah transformasi

  kategori_id: string;
  nama_kategori: string | null; // Setelah transformasi

  ruangan_id: string; // Ini ID biasa, bukan NullString
  nama_ruangan: string | null; // Setelah transformasi

  id: number;
  jumlah: number;
  keterangan: string | null;
  old_inventory_code: string | null;
  status: string; // Setelah transformasi (dari interface{} di Go)
  created_at: string;
  created_by: string;
  updated_at: NullableTime | null;
  updated_by: string | null; // Setelah transformasi
  deleted_at: NullableTime | null;
  deleted_by: string | null; // Setelah transformasi
}

applyPlugin(jsPDF);

export default function InventoryList() {
  const [data, setData] = useState<Inventaris[]>([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const currentToken = token || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWRtaW4tdGVzdCIsIm5hbWUiOiJBZG1pbiIsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJyb2xlX2lkIjoiMTIzNDUifQ.Slightly_Different_Dummy_Token_For_Frontend_Dev";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get<{data: any[], message: string}>("https://hris-wit-be-api.onrender.com/inventaris/with-relations", {
          headers: { Authorization: `Bearer ${currentToken}` },
        });

        // --- PERBAIKAN KRUSIAL: Transformasi data yang diterima agar sesuai interface frontend ---
        const getStringOrNull = (val: any): string | null => {
            if (typeof val === 'object' && val !== null && 'String' in val && val.Valid) {
                return val.String;
            } else if (typeof val === 'string') {
                return val;
            }
            return null;
        };

        const getEnumValue = (val: any): string => {
            if (typeof val === 'string') {
                return val;
            } else if (typeof val === 'object' && val !== null) {
                return String(val); // Konversi paksa interface{} ke string
            }
            return "";
        };

        const transformedData: Inventaris[] = res.data.data.map((item: any) => {
            return {
                id: item.id,
                inventaris_id: item.inventaris_id,
                nama_inventaris: item.nama_inventaris,
                jumlah: item.jumlah,
                tanggal_beli: item.tanggal_beli,
                harga: item.harga,
                image_url: getStringOrNull(item.image_url),
                brand_id: item.brand_id,
                nama_brand: getStringOrNull(item.nama_brand),
                vendor_id: item.vendor_id,
                nama_vendor: getStringOrNull(item.nama_vendor),
                kategori_id: item.kategori_id,
                nama_kategori: getStringOrNull(item.nama_kategori),
                ruangan_id: item.ruangan_id,
                nama_ruangan: getStringOrNull(item.nama_ruangan),
                keterangan: getStringOrNull(item.keterangan),
                old_inventory_code: getStringOrNull(item.old_inventory_code),
                status: getEnumValue(item.status),
                created_at: item.created_at,
                created_by: item.created_by,
                updated_at: item.updated_at || null,
                updated_by: getStringOrNull(item.updated_by),
                deleted_at: item.deleted_at || null,
                deleted_by: getStringOrNull(item.deleted_by),
            };
        });

        setData(transformedData);
        console.log("Fetched Inventory Data (Transformed):", transformedData);

        if (transformedData.length === 0) {
            toast.info("Tidak ada data inventaris.");
        }
      } catch (error) {
        toast.error("Gagal memuat data inventory");
        console.error("Fetch inventory error:", error);
        if (axios.isAxiosError(error) && error.response) {
            console.error("Error Response Data:", error.response.data);
            console.error("Error Response Status:", error.response.status);
        }
      }
    };
    fetchData();
  }, [currentToken]);

  const columns: ColumnDef<Inventaris>[] = [
    {
      accessorKey: 'image_url',
      header: 'Gambar',
      cell: info => (
        info.getValue() ? (
          <img src={info.getValue() as string} alt="Preview" className="h-14 object-contain rounded border" />
        ) : (
          "-"
        )
      ),
      enableSorting: false,
