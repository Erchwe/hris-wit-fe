import {useEffect, useState} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePelamar } from "./Pelamar";

export interface IdentitasDiri {
    id_lowongan_pekerjaan: string;
    email: string;
    nama_lengkap: string;
    tempat_lahir?: string;
    tgl_lahir?: string;
    jenis_kelamin: "Laki-laki" | "Perempuan";
    kewarganegaraan?: string;
    phone?: string;
    mobile?: string;
    agama?: string;
    gol_darah?: string;
    status_menikah: boolean;
    no_ktp?: string;
    no_npwp?: string;
    status: "New"|"Short list"|"HR Interview"|"User Interview"|"Refference Checking"|"Offering"|"Psikotest"|"Hired"|"Rejected";
    asal_kota?: string;
    gaji_terakhir?: number;
    harapan_gaji?: number;
    sedang_bekerja?: string;
    ketersediaan_bekerja?: string;
    sumber_informasi?: string;
    alasan?: string;
    ketersediaan_inter?: string;
    profesi_kerja?: string;
}

export default function IdentitasDiri() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { data, setData } = usePelamar();

    const [form, setForm] = useState<IdentitasDiri>({
        id_lowongan_pekerjaan: "",
        email: "",
        nama_lengkap: "",
        tempat_lahir: "",
        tgl_lahir: "",
        jenis_kelamin: "Laki-laki",
        kewarganegaraan: "",
        phone: "",
        mobile: "",
        agama: "",
        gol_darah: "",
        status_menikah: false,
        no_ktp: "",
        no_npwp: "",
        status: "New",
        asal_kota: "",
        gaji_terakhir: 0,
        harapan_gaji: 0,
        sedang_bekerja: "",
        ketersediaan_bekerja: "",
        sumber_informasi: "",
        alasan: "",
        ketersediaan_inter: "",
        profesi_kerja: "Junior",
    });

    useEffect(() => {
        const idLowongan = searchParams.get("id");
        if (idLowongan) {
            setForm((prev) => ({
                ...prev,
                idLowonganPekerjaan: idLowongan,
            }));
        }
    }, [searchParams]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;

        const val =
            type === "checkbox" && "checked" in e.target
                ? (e.target as HTMLInputElement).checked
                : value;

        setForm((prev) => ({
            ...prev,
            [name]: val,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const idLowongan = searchParams.get("id");

        if (!idLowongan) {
            alert("Terjadi kesalahan: ID Lowongan tidak ditemukan.");
            return;
        }

        const newIdentitas = {
            ...form,
            id_lowongan_pekerjaan: idLowongan,

            gaji_terakhir: data.identitas?.gaji_terakhir || 0,
            harapan_gaji: data.identitas?.harapan_gaji || 0,
        };

        setData((prev) => ({
            ...prev,
            identitas: newIdentitas,
        }));

        navigate(`/pelamarForm/dataKeluarga?id=${idLowongan}`);
    };

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-8">
            <h1 className="text-2xl font-bold mb-6">Form Identitas Diri Pelamar</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                    <label className="block font-medium mb-1" htmlFor="email">Email *</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                {/* Nama Lengkap */}
                <div>
                    <label className="block font-medium mb-1" htmlFor="nama_lengkap">Nama Lengkap *</label>
                    <input
                        type="text"
                        id="namaLengkap"
                        name="nama_lengkap"
                        value={form.nama_lengkap}
                        onChange={handleChange}
                        required
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                {/* Tempat Lahir */}
                <div>
                    <label className="block font-medium mb-1" htmlFor="tempat_lahir">Tempat Lahir</label>
                    <input
                        type="text"
                        id="tempatLahir"
                        name="tempat_lahir"
                        value={form.tempat_lahir}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                {/* Tanggal Lahir */}
                <div>
                    <label className="block font-medium mb-1" htmlFor="tgl_lahir">Tanggal Lahir</label>
                    <input
                        type="date"
                        id="tglLahir"
                        name="tgl_lahir"
                        value={form.tgl_lahir}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                {/* Jenis Kelamin */}
                <div>
                    <label className="block font-medium mb-1" htmlFor="jenis_kelamin">Jenis Kelamin *</label>
                    <select
                        id="jenisKelamin"
                        name="jenis_kelamin"
                        value={form.jenis_kelamin}
                        onChange={handleChange}
                        required
                        className="w-full border rounded px-3 py-2"
                    >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                    </select>
                </div>

                {/* Kewarganegaraan */}
                <div>
                    <label className="block font-medium mb-1" htmlFor="kewarganegaraan">Kewarganegaraan</label>
                    <input
                        type="text"
                        id="kewarganegaraan"
                        name="kewarganegaraan"
                        value={form.kewarganegaraan}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                {/* Phone */}
                <div>
                    <label className="block font-medium mb-1" htmlFor="phone">Phone</label>
                    <input
                        type="text"
                        id="phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                {/* Mobile */}
                <div>
                    <label className="block font-medium mb-1" htmlFor="mobile">Mobile</label>
                    <input
                        type="text"
                        id="mobile"
                        name="mobile"
                        value={form.mobile}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                {/* Agama */}
                <div>
                    <label className="block font-medium mb-1" htmlFor="agama">Agama</label>
                    <input
                        type="text"
                        id="agama"
                        name="agama"
                        value={form.agama}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                {/* Golongan Darah */}
                <div>
                    <label className="block font-medium mb-1" htmlFor="gol_darah">Golongan Darah</label>
                    <input
                        type="text"
                        id="golDarah"
                        name="gol_darah"
                        value={form.gol_darah}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                {/* Status Menikah */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="statusMenikah"
                        name="status_menikah"
                        checked={form.status_menikah}
                        onChange={handleChange}
                        className="form-checkbox"
                    />
                    <label htmlFor="status_menikah" className="font-medium">Status Menikah</label>
                </div>

                {/* No. KTP */}
                <div>
                    <label className="block font-medium mb-1" htmlFor="no_ktp">No. KTP</label>
                    <input
                        type="text"
                        id="noKtp"
                        name="no_ktp"
                        value={form.no_ktp}
                        onChange={handleChange}
                        maxLength={16}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                {/* No. NPWP */}
                <div>
                    <label className="block font-medium mb-1" htmlFor="no_npwp">No. NPWP</label>
                    <input
                        type="text"
                        id="noNpwp"
                        name="no_npwp"
                        value={form.no_npwp}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                {/* Status */}
                <div>
                    <label className="block font-medium mb-1" htmlFor="status">Status</label>
                    <select
                        id="status"
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    >
                        <option value="New">New</option>
                        <option value="Short list">Short list</option>
                        <option value="HR Interview">HR Interview</option>
                        <option value="User Interview">User Interview</option>
                        <option value="Refference Checking">Refference Checking</option>
                        <option value="Offering">Offering</option>
                        <option value="Hired">Hired</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>

                {/* Asal Kota */}
                <div>
                    <label className="block font-medium mb-1" htmlFor="asal_kota">Asal Kota</label>
                    <input
                        type="text"
                        id="asalKota"
                        name="asal_kota"
                        value={form.asal_kota}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                {/* Gaji Terakhir */}
                <div>
                    <label className="block font-medium mb-1" htmlFor="gaji_terakhir">Gaji Terakhir</label>
                    <input
                        type="number"
                        id="gajiTerakhir"
                        name="gaji_terakhir"
                        value={form.gaji_terakhir}
                        onChange={handleChange}
                        step="0.01"
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                {/* Harapan Gaji */}
                <div>
                    <label className="block font-medium mb-1" htmlFor="harapan_gaji">Harapan Gaji</label>
                    <input
                        type="number"
                        id="harapanGaji"
                        name="harapan_gaji"
                        value={form.harapan_gaji}
                        onChange={handleChange}
                        step="0.01"
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                {/* Sedang Bekerja */}
                <div>
                    <label className="block font-medium mb-1" htmlFor="sedang_bekerja">Sedang Bekerja</label>
                    <input
                        type="text"
                        id="sedang_bekerja"
                        name="sedangBekerja"
                        value={form.sedang_bekerja}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                {/* Ketersediaan Bekerja */}
                <div>
                    <label className="block font-medium mb-1" htmlFor="ketersediaan_bekerja">Ketersediaan Bekerja</label>
                    <input
                        type="date"
                        id="ketersediaanBekerja"
                        name="ketersediaan_bekerja"
                        value={form.ketersediaan_bekerja}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                {/* Sumber Informasi */}
                <div>
                    <label className="block font-medium mb-1" htmlFor="sumber_informasi">Sumber Informasi</label>
                    <input
                        type="text"
                        id="sumberInformasi"
                        name="sumber_informasi"
                        value={form.sumber_informasi}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                {/* Alasan */}
                <div>
                    <label className="block font-medium mb-1" htmlFor="alasan">Alasan</label>
                    <textarea
                        id="alasan"
                        name="alasan"
                        value={form.alasan}
                        onChange={handleChange}
                        rows={3}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                {/* Ketersediaan Interview */}
                <div>
                    <label className="block font-medium mb-1" htmlFor="ketersediaan_inter">Ketersediaan Interview</label>
                    <input
                        type="datetime-local"
                        id="ketersediaanInter"
                        name="ketersediaan_inter"
                        value={form.ketersediaan_inter}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                {/* Profesi Kerja */}
                <div>
                    <label className="block font-medium mb-1" htmlFor="profesi_kerja">Profesi Kerja</label>
                    <select
                        id="profesi_kerja"
                        name="profesiKerja"
                        value={form.profesi_kerja}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                    >
                        <option value="Junior">Junior</option>
                        <option value="Senior">Senior</option>
                        <option value="Manager">Manager</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700" >
                    Next
                </button>
            </form>
        </div>
    );
}
