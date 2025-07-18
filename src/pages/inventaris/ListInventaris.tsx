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


// Interface Inventaris disesuaikan dengan pola Proyek.tsx
interface Inventaris {
  inventaris_id: string;
  nama_inventaris: string; // Asumsi ini string biasa
  tanggal_beli: string;
  harga: number;
  image_url?: SqlNullString | null; // Objek {String, Valid} atau null

  brand_id: string;
  nama_brand: SqlNullString | null; // Objek {String, Valid} atau null

  vendor_id: string;
  nama_vendor: SqlNullString | null; // Objek {String, Valid} atau null

  kategori_id: string;
  nama_kategori: SqlNullString | null; // Objek {String, Valid} atau null

  ruangan_id: string;
  nama_ruangan: SqlNullString | null; // Objek {String, Valid} atau null

  id: number;
  jumlah: number;
  keterangan: SqlNullString | null;
  old_inventory_code: SqlNullString | null;
  status: any; // Untuk ENUM, gunakan 'any' atau buat interface lebih spesifik
  created_at: string;
  created_by: string;
  updated_at: NullableTime | null;
  updated_by: SqlNullString | null;
  deleted_at: NullableTime | null;
  deleted_by: SqlNullString | null;
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
        const res = await axios.get<{data: Inventaris[], message: string}>("https://hris-wit-be-api.onrender.com/inventaris/with-relations", {
          headers: { Authorization: `Bearer ${currentToken}` },
        });

        setData(res.data.data); // Hapus transformasi .map() jika interface sudah cocok
        console.log("Fetched Inventory Data:", res.data.data); // Log data mentah

        if (res.data.data.length === 0) {
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
        // Akses .String dari SqlNullString
        info.getValue()?.Valid ? (
          <img src={info.getValue().String as string} alt="Preview" className="h-14 object-contain rounded border" />
        ) : (
          "-"
        )
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      accessorKey: 'nama_inventaris',
      header: 'Nama',
    },
    {
      accessorKey: 'nama_brand',
      header: 'Brand',
      cell: info => (info.getValue() as SqlNullString)?.String || "-", // Akses .String
    },
    {
      accessorKey: 'tanggal_beli',
      header: 'Tanggal Beli',
      cell: info => {
        const dateString = info.getValue() as string;
        if (!dateString || isNaN(new Date(dateString).getTime())) {
            return "-";
        }
        return new Date(dateString).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
      },
    },
    {
      accessorKey: 'harga',
      header: 'Harga',
      cell: info => {
          const price = info.getValue() as number;
          if (typeof price !== 'number' || isNaN(price)) {
              return "Rp -";
          }
          return `Rp ${price.toLocaleString("id-ID")}`;
      },
    },
    {
      accessorKey: 'nama_vendor',
      header: 'Vendor',
      cell: info => (info.getValue() as SqlNullString)?.String || "-", // Akses .String
    },
    {
      accessorKey: 'nama_kategori',
      header: 'Kategori',
      cell: info => (info.getValue() as SqlNullString)?.String || "-", // Akses .String
    },
    {
      accessorKey: 'nama_ruangan',
      header: 'Ruangan',
      cell: info => (info.getValue() as SqlNullString)?.String || "-", // Akses .String
    },
    {
      accessorKey: 'status',
      header: 'Status Inventaris',
      cell: info => decodeEnum(info.getValue()) || "-", // Gunakan decodeEnum
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleDownloadPdf = () => {
    const doc = new jsPDF('l', 'mm', 'a4') as any;

    doc.text("Daftar Inventaris", 14, 15);

    const pdfTableHeaders = columns
      .filter(col => col.header !== 'Gambar')
      .map(col => col.header as string);

    const pdfTableRows = data.map(item => [
      item.nama_inventaris,
      item.nama_brand?.String || '-', // Akses .String
      new Date(item.tanggal_beli).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }),
      `Rp ${item.harga.toLocaleString("id-ID")}`,
      item.nama_vendor?.String || '-', // Akses .String
      item.nama_kategori?.String || '-', // Akses .String
      item.nama_ruangan?.String || '-', // Akses .String
      decodeEnum(item.status) || '-', // Gunakan decodeEnum
    ]);

    doc.autoTable({
      head: [pdfTableHeaders],
      body: pdfTableRows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
      didDrawPage: function (data: AutoTableDidDrawPageHookData) {
        doc.setFontSize(8);
        const pageCount = doc.internal.getNumberOfPages();
        doc.text(`Page ${data.pageNumber} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
      }
    });

    doc.save("daftar-inventaris.pdf");
    toast.success("PDF berhasil diunduh!");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Daftar Inventaris</h1>
      <div className="flex justify-end mb-4">
        <Button onClick={handleDownloadPdf} color="blue">
          Unduh PDF
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table hoverable>
          <Table.Head>
            {table.getHeaderGroups()[0].headers.map(header => (
                <Table.HeadCell key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                </Table.HeadCell>
            ))}
          </Table.Head>
          <Table.Body className="divide-y">
            {data.length === 0 ? (
                <Table.Row>
                    <Table.Cell colSpan={columns.length} className="text-center text-gray-500">Tidak ada data inventaris yang tersedia.</Table.Cell>
                </Table.Row>
            ) : (
                table.getRowModel().rows.map(row => (
                    <Table.Row
                        key={row.original.id} // Gunakan row.original.id
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => navigate(`/inventaris/with-relations/${row.original.inventaris_id}`)}
                    >
                        {row.getVisibleCells().map(cell => (
                            <Table.Cell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </Table.Cell>
                        ))}
                    </Table.Row>
                ))
            )}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}
