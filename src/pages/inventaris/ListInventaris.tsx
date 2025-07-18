import { useEffect, useState } from "react";
import api from '../../utils/api.ts';
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

interface Inventaris {
  inventaris_id: string;
  nama_inventaris: string;
  tanggal_beli: string;
  harga: number;
  image_url?: string | null;

  brand_id: string;
  nama_brand: string | null;

  vendor_id: string;
  nama_vendor: string | null;

  kategori_id: string;
  nama_kategori: string | null;

  ruangan_id: string;
  nama_ruangan: string | null;
}

applyPlugin(jsPDF);

export default function InventoryList() {
  const [data, setData] = useState<Inventaris[]>([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/inventaris/with-relations", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const cleaned: Inventaris[] = res.data.data.map((item: any) => ({
          ...item,
          image_url: item.image_url?.String ?? "",
          vendor_id: item.vendor_id?.String ?? "",
          nama_vendor: item.nama_vendor?.String ?? "",
          brand_id: item.brand_id?.String ?? "",
          nama_brand: item.nama_brand?.String ?? "",
          kategori_id: item.kategori_id?.String ?? "",
          nama_kategori: item.nama_kategori?.String ?? "",
          ruangan_id: item.ruangan_id?.String ?? "",
          nama_ruangan: item.nama_ruangan?.String ?? "",
        }));

        setData(cleaned);
      } catch (error) {
        toast.error("Gagal memuat data inventory");
        console.error("Fetch inventory error:", error);
      }
    };

    fetchData();
  }, [token]);

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
      enableColumnFilter: false,
    },
    {
      accessorKey: 'nama_inventaris',
      header: 'Nama',
    },
    {
      accessorKey: 'nama_brand',
      header: 'Brand',
      cell: info => info.getValue() || "-",
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
      cell: info => info.getValue() || "-",
    },
    {
      accessorKey: 'nama_kategori',
      header: 'Kategori',
      cell: info => info.getValue() || "-",
    },
    {
      accessorKey: 'nama_ruangan',
      header: 'Ruangan',
      cell: info => info.getValue() || "-",
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
      item.nama_brand || '-',
      new Date(item.tanggal_beli).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }),
      `Rp ${item.harga.toLocaleString("id-ID")}`,
      item.nama_vendor || '-',
      item.nama_kategori || '-',
      item.nama_ruangan || '-',
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
            {table.getRowModel().rows.map(row => (
              <Table.Row
                key={row.id}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => navigate(`/inventaris/with-relations/${row.original.inventaris_id}`)}
              >
                {row.getVisibleCells().map(cell => (
                  <Table.Cell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}
