import { useEffect, useState } from "react";
import api from '../../utils/api';
import { Table } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface Vendor {
  vendor_id: string;
  nama_vendor: string;
  alamat: string;
  status: string;
}

export default function VendorList() {
  const [data, setData] = useState<Vendor[]>([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/vendor", {
          // headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data.data);
      } catch (error) {
        toast.error("Gagal memuat data vendor");
      }
    };
    fetchData();
  }, [token]);

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
            {data.map((item) => (
              <Table.Row
                key={item.vendor_id}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => navigate(`/vendor/${item.vendor_id}`)}
              >
                <Table.Cell>{item.nama_vendor}</Table.Cell>
                <Table.Cell>{item.alamat}</Table.Cell>
                <Table.Cell>{item.status}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}
