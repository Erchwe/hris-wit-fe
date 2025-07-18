import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePelamar } from "./Pelamar.tsx";
import api from '../../utils/api.ts';

export interface Referensi {
    nama: string;
    nama_perusahaan: string;
    jabatan: string;
    no_telp_perusahaan: string;
}

export default function Referensi() {
    const { data, setData } = usePelamar();
    const [referensi, setReferensi] = useState<Referensi[]>([
        { nama: "", nama_perusahaan: "", jabatan: "", no_telp_perusahaan: "" },
    ]);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const idLowongan = searchParams.get("id");

    const handlePreviousForm = () => {
        navigate(`/pelamarForm/PengalamanKerja?id=${idLowongan}`);
    };

    const handleChange = (
        index: number,
        field: keyof Referensi,
        value: string
    ) => {
        setReferensi((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleAdd = () => {
        setReferensi((prev) => [
            ...prev,
            { nama: "", nama_perusahaan: "", jabatan: "", no_telp_perusahaan: "" },
        ]);
    };

    const handleRemove = (index: number) => {
        setReferensi((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const referensiPayload = referensi.map(item => ({
            nama: item.nama,
            nama_perusahaan: item.nama_perusahaan,
            jabatan: item.jabatan,
            no_telp_perusahaan: item.no_telp_perusahaan,
        }));

        setData(prev => ({
            ...prev,
            referensi: referensi
        }));


        const finalPayload = {
            pelamar: data.identitas,
            keluarga: data.keluarga,
            anak: data.keluarga?.anak,
            saudara_kandung: data.keluarga?.saudara_kandung,
            pendidikan_formal: data.pendidikan?.formal,
            pendidikan_non_formal: data.pendidikan?.nonFormal,
            bahasa: data.pendidikan?.bahasa,
            pengalaman_kerja: data.pengalamanKerja,
            referensi: referensiPayload,
        };

        console.log("Final payload yang dikirim (sudah snake_case):", finalPayload);

        try {
            await api.post("/pelamar/insert", finalPayload);
            alert("Data lamaran berhasil dikirim!");
            navigate("/karyawan/daftarkaryawan");
        } catch (err) {
            interface AxiosErrorResponse {
                response?: {
                    data?: {
                        message?: string;
                    };
                };
            }

            const axiosError = err as AxiosErrorResponse;
            const errorMessage = axiosError.response?.data?.message || "Gagal menyimpan data pelamar.";

            console.error("Error saat mengirim data:", err);
            alert(errorMessage);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <h2 className="text-xl font-bold mb-4">Referensi</h2>

            {referensi.map((item, index) => (
                <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md relative"
                >
                    <input
                        className="input"
                        placeholder="Nama"
                        value={item.nama}
                        onChange={(e) => handleChange(index, "nama", e.target.value)}
                    />
                    <input
                        className="input"
                        placeholder="Nama Perusahaan"
                        value={item.nama_perusahaan}
                        onChange={(e) =>
                            handleChange(index, "nama_perusahaan", e.target.value)
                        }
                    />
                    <input
                        className="input"
                        placeholder="Jabatan"
                        value={item.jabatan}
                        onChange={(e) => handleChange(index, "jabatan", e.target.value)}
                    />
                    <input
                        className="input"
                        placeholder="No. Telepon Perusahaan"
                        value={item.no_telp_perusahaan}
                        onChange={(e) => handleChange(index, "no_telp_perusahaan", e.target.value)}
                    />
                    {index > 0 && (
                        <button
                            type="button"
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                            onClick={() => handleRemove(index)}
                            title="Hapus referensi"
                        >
                            🗑️
                        </button>
                    )}
                </div>
            ))}

            <button
                type="button"
                onClick={handleAdd}
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                + Tambah Referensi
            </button>

            <div className="mt-8 flex gap-4">
                <button
                    type="button"
                    onClick={handlePreviousForm}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                    Previous
                </button>

                <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
                >
                    Finish
                </button>
            </div>
        </form>
    );
}
