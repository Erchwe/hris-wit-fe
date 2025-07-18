import { useState } from "react";
import { Sidebar, Navbar, Dropdown, Avatar } from "flowbite-react";
import {
  HiChartPie,
  HiBriefcase,
  HiCash,
  HiClipboardList,
  HiMenuAlt1,
} from "react-icons/hi";
import { Link, Outlet } from "react-router-dom";
import classNames from "classnames";
// Hapus impor SidebarFolder karena tidak lagi digunakan
// import SidebarFolder from "../../components/SidebarFolder";

const StyledHiChartPie = () => <HiChartPie className="h-4 w-4 text-gray-500" />;
const StyledHiCash = () => <HiCash className="h-5 w-5 text-gray-500" />;
const StyledHiClipboardList = () => <HiClipboardList className="h-5 w-5 text-gray-500" />;
const StyledHiBriefcase = () => <HiBriefcase className="h-5 w-5 text-gray-500" />;

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      <div
        className={classNames("transition-all duration-300 bg-white border-r", {
          "w-64": !collapsed,
          "w-20": collapsed,
        })}
      >
        {/* Tambahkan prop 'collapsed' ke Sidebar utama */}
        <Sidebar className="h-full overflow-y-auto" collapsed={collapsed}>
          <div className="flex items-center justify-between p-4 border-b">
            <span className="text-xl font-bold text-gray-800">
              {!collapsed ? "HRMONIZE" : "H"}
            </span>
            <button onClick={() => setCollapsed((prev) => !prev)}>
              <HiMenuAlt1 className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <Sidebar.ItemGroup>
            <Sidebar.Item
              icon={StyledHiChartPie}
              as={Link}
              to="/dashboard"
            >
              Dashboard
            </Sidebar.Item>

            {/* Ganti SidebarFolder dengan Sidebar.Collapse */}
            <Sidebar.Collapse
              icon={StyledHiCash}
              label="Remunerasi Karyawan"
            >
              <Sidebar.Item as={Link} to="/remunerasi/gaji">Gaji</Sidebar.Item>
              <Sidebar.Item as={Link} to="/remunerasi/tunjangan">Tunjangan</Sidebar.Item>
            </Sidebar.Collapse>

            <Sidebar.Collapse
              icon={StyledHiClipboardList}
              label="Inventaris Barang"
            >
              <Sidebar.Item as={Link} to="/inventaris/dashboardinventaris">Dashboard</Sidebar.Item>
              <Sidebar.Item as={Link} to="/inventaris/insertinventaris">Tambah</Sidebar.Item>
              <Sidebar.Item as={Link} to="/inventaris/listinventaris">Daftar</Sidebar.Item>
            </Sidebar.Collapse>

            <Sidebar.Collapse
              icon={StyledHiCash}
              label="Vendor Barang"
            >
              <Sidebar.Item as={Link} to="/vendor/insertvendor">Tambah Vendor</Sidebar.Item>
              <Sidebar.Item as={Link} to="/vendor/listvendor">Daftar Vendor</Sidebar.Item>
            </Sidebar.Collapse>

            <Sidebar.Collapse
              icon={StyledHiCash}
              label="Peminjaman"
            >
              <Sidebar.Item as={Link} to="/peminjaman/listpeminjaman">Ajukan</Sidebar.Item>
              <Sidebar.Item as={Link} to="/peminjaman/listpengajuan">Daftar Pengajuan</Sidebar.Item>
              <Sidebar.Item as={Link} to="/peminjaman/approvalpeminjaman">Daftar Approval</Sidebar.Item>
            </Sidebar.Collapse>

            <Sidebar.Collapse
              icon={StyledHiBriefcase}
              label="Karyawan"
            >
              <Sidebar.Item as={Link} to="/karyawan/daftarkaryawan">Data Pelamar</Sidebar.Item>
              <Sidebar.Item as={Link} to="/karyawan/dataPegawai">Data Pegawai</Sidebar.Item>
              <Sidebar.Item as={Link} to="/karyawan/recruitment">Lowongan</Sidebar.Item>
            </Sidebar.Collapse>

            <Sidebar.Collapse
              icon={StyledHiBriefcase}
              label="Manajemen Proyek"
            >
              <Sidebar.Item as={Link} to="/manajemen_proyek/Dashboard">Dashboard</Sidebar.Item>
              <Sidebar.Item as={Link} to="/manajemen_proyek/Proyek">Projects</Sidebar.Item>
              <Sidebar.Item as={Link} to="/manajemen_proyek/Client">Client</Sidebar.Item>
              <Sidebar.Item as={Link} to="/manajemen_proyek/Report">Report</Sidebar.Item>
            </Sidebar.Collapse>
          </Sidebar.ItemGroup>
        </Sidebar>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar fluid rounded className="border-b shadow-sm">
          <div className="flex items-center justify-between w-full">
            <div></div>
            <div className="flex items-center ml-auto">
              <Dropdown
                arrowIcon={false}
                inline
                label={<Avatar img="https://i.pravatar.cc/40" rounded />}
              >
                <Dropdown.Header>
                  <span className="block text-sm">Danu Zafir</span>
                  <span className="block text-sm text-gray-500 truncate">
                    danu@example.com
                  </span>
                </Dropdown.Header>
                <Dropdown.Item>Dashboard</Dropdown.Item>
                <Dropdown.Item>Settings</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item>Logout</Dropdown.Item>
              </Dropdown>
            </div>
          </div>
        </Navbar>

        <main className="flex-1 bg-white p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
