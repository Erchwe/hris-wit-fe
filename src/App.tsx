import { Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Gaji from "./pages/remunerasi/Gaji";
import Tunjangan from "./pages/remunerasi/Tunjangan";
import DaftarKaryawan from "./pages/karyawan/DaftarKaryawan";

import DataPegawai from "./pages/karyawan/DataPegawai.tsx";
import Recruitment from "./pages/karyawan/Recruitment.tsx";
import Login from "./pages/Login";
import PelamarForm from "./pages/PelamarForm";
import CreateRecruitment from "./pages/karyawan/CreateRecruitment.tsx";
import DetailRecruitment from "./pages/karyawan/DetailRecruitment.tsx";
import EditRecruitment from "./pages/karyawan/EditRecruitment.tsx";
import IdentitasDiri from "./pages/Pelamar/IdentitasDiri.tsx";
import DataKeluarga from "./pages/Pelamar/DataKeluarga.tsx";
import RiwayatPendidikan from "./pages/Pelamar/RiwayatPendidikan.tsx";
import PengalamanKerja from "./pages/Pelamar/PengalamanKerja.tsx";
import Referensi from "./pages/Pelamar/Referensi.tsx";
import DetailKaryawan from "./pages/karyawan/DetailKaryawan.tsx";
import Proyek from "./pages/manajemen_proyek/Proyek";
import ClientList from "./pages/manajemen_proyek/Client"; 
import ProjectDetail from "./pages/manajemen_proyek/ProjectDetail";
import Dashboard from "./pages/manajemen_proyek/Dashboard";
import Report from "./pages/manajemen_proyek/Report";
import InsertInventaris from "./pages/inventaris/InsertInventaris";
import ListInventaris from "./pages/inventaris/ListInventaris.tsx";
import UpdateInventaris from "./pages/inventaris/UpdateInventaris.tsx";
import DetailInventaris from "./pages/inventaris/InventarisDetail.tsx";
import DashboardInventaris from "./pages/inventaris/DashboardInventaris.tsx";
import ListVendor from "./pages/vendor/ListVendor.tsx";
import InsertVendor from "./pages/vendor/InsertVendor.tsx";
import DetailVendor from "./pages/vendor/DetailVendor.tsx"
import UpdateVendor from "./pages/vendor/UpdateVendor.tsx"
import ListPeminjaman from "./pages/peminjaman/AjukanPeminjaman.tsx"
import ListPengajuan from "./pages/peminjaman/DaftarPeminjaman.tsx"
import ApprovalPeminjaman from "./pages/peminjaman/ApprovalPeminjaman.tsx"

console.log('DEBUG: VITE_API_BASE_URL resolved to:', import.meta.env.VITE_API_BASE_URL);

function App() {
    return (
        <Routes>
            {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}
            <Route path="/" element={<Dashboard/>}></Route>

            <Route path="/login" element={<Login />} />

            <Route path="/pelamarForm" element={<PelamarForm />}/>
            <Route path="/pelamarForm/identitasDiri" element={<IdentitasDiri />}/>
            <Route path="/pelamarForm/dataKeluarga" element={<DataKeluarga />}/>
            <Route path="/pelamarForm/RiwayatPendidikan" element={<RiwayatPendidikan />}/>
            <Route path="/pelamarForm/PengalamanKerja" element={<PengalamanKerja />}/>
            <Route path="/pelamarForm/Referensi" element={<Referensi />}/>
            <Route path="/pelamarForm/DetailKaryawan/:id_data_pelamar" element={<DetailKaryawan />} />

            <Route path="/" element={<AppLayout />}>
                {/* <Route path="dashboard" element={<Dashboard />} /> */}
                <Route path="remunerasi/gaji" element={<Gaji />} />
                <Route path="remunerasi/tunjangan" element={<Tunjangan />} />
                <Route path="karyawan/daftarkaryawan" element={<DaftarKaryawan />} />
              
                <Route path="karyawan/dataPegawai" element={<DataPegawai />} />
                <Route path="karyawan/recruitment" element={<Recruitment />} />
                <Route path="karyawan/createRecruitment" element={<CreateRecruitment />} />
                <Route path="karyawan/recruitment/:id" element={<DetailRecruitment />} />
                <Route path="karyawan/recruitment/update/:id" element={<EditRecruitment />} />
                <Route path="manajemen_proyek/proyek" element={<Proyek />} />
                <Route path="manajemen_proyek/Client" element={<ClientList />} />
                <Route path="manajemen_proyek/dashboard" element={<Dashboard />} />
                <Route path="manajemen_proyek/Report" element={<Report />} />
                <Route path="manajemen_proyek/project/:projectId" element={<ProjectDetail />} />
                <Route path="/inventaris/insertinventaris" element={<InsertInventaris />} />
                <Route path="/inventaris/listinventaris" element={<ListInventaris />} />
                <Route path="/inventaris/dashboardinventaris" element={<DashboardInventaris />} />
                <Route path="/inventaris/update/:id" element={<UpdateInventaris />} />
                <Route path="/inventaris/with-relations/:id" element={<DetailInventaris />} />
                <Route path="/vendor/insertvendor" element={<InsertVendor />} />
                <Route path="/vendor/listvendor" element={<ListVendor />} />
                <Route path="/vendor/detailvendor" element={<DetailVendor />} />
                <Route path="/vendor/updatevendor/:id" element={<UpdateVendor />} />
                <Route path="/peminjaman/listpeminjaman" element={<ListPeminjaman />} />
                <Route path="/peminjaman/listpengajuan" element={<ListPengajuan />} />
                <Route path="/peminjaman/approvalpeminjaman" element={<ApprovalPeminjaman />} />
            </Route>
        </Routes>
    );
}

export default App;
