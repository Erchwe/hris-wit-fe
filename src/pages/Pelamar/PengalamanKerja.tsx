import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePelamar } from "./Pelamar";

export interface PengalamanKerja {
    nama_perusahaan: string;
    periode: string;
    jabatan: string;
    gaji: string;
    alasan_pindah: string;
}

export default function PengalamanKerjaForm() {
    const [searchParams] = useSearchParams();
    const idLowongan = searchParams.get("id");

    const [form, setPengalaman] = useState<PengalamanKerja[]>([
        {
            nama_perusahaan: "",
            periode: "",
            jabatan: "",
            gaji: "",
            alasan_pindah: "",
        },
    ]);

    const navigate = useNavigate();
    const { setData } = usePelamar();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (form.some(item => !item.nama_perusahaan || !item.periode || !item.jabatan)) {
            alert("Mohon lengkapi nama perusahaan, periode, dan jabatan untuk setiap pengalaman kerja.");
            return;
        }

        setData(prev => ({
            ...prev,
            pengalamanKerja: form
        }));

        navigate(`/pelamarForm/Referensi?id=${idLowongan}`);
    };

    const handlePreviousForm = () => {
        navigate(`/pelamarForm/RiwayatPendidikan?id=${idLowongan}`);
    };

    const handleChange = (
        index: number,
        field: keyof PengalamanKerja,
        value: string
    ) => {
        setPengalaman((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleAdd = () => {
        setPengalaman((prev) => [
            ...prev,
            {
                nama_perusahaan: "",
                periode: "",
                jabatan: "",
                gaji: "",
                alasan_pindah: "",
            },
        ]);
    };

    const handleRemove = (index: number) => {
        setPengalaman((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="max-w-screen-lg mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">Pengalaman Kerja</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {form.map((item, index) => (
                    <div
                        key={index}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md relative"
                    >
                        <input
                            className="w-full border px-3 py-2 rounded-md"
                            placeholder="Nama Perusahaan"
                            value={item.nama_perusahaan}
                            onChange={(e) =>
                                handleChange(index, "nama_perusahaan", e.target.value)
                            }
                        />
                        <input
                            className="w-full border px-3 py-2 rounded-md"
                            placeholder="Periode (cth: Jan 2020 - Mar 2023)"
                            value={item.periode}
                            onChange={(e) => handleChange(index, "periode", e.target.value)}
                        />
                        <input
                            className="w-full border px-3 py-2 rounded-md"
                            placeholder="Jabatan"
                            value={item.jabatan}
                            onChange={(e) => handleChange(index, "jabatan", e.target.value)}
                        />
                        <input
                            className="w-full border px-3 py-2 rounded-md"
                            placeholder="Gaji"
                            type="number"
                            value={item.gaji}
                            onChange={(e) => handleChange(index, "gaji", e.target.value)}
                        />
                        <textarea
                            className="w-full border px-3 py-2 rounded-md md:col-span-2"
                            placeholder="Alasan Pindah"
                            value={item.alasan_pindah}
                            onChange={(e) =>
                                handleChange(index, "alasan_pindah", e.target.value)
                            }
                            rows={2}
                        />

                        {form.length > 1 && (
                            <button
                                type="button"
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                onClick={() => handleRemove(index)}
                                title="Hapus Pengalaman"
                            >
                                🗑️
                            </button>
                        )}
                    </div>
                ))}

                <button
                    type="button"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={handleAdd}
                >
                    + Tambah Pengalaman Kerja
                </button>

                <div className="mt-8 flex gap-4">
                    <button
                        type="button"
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                        onClick={handlePreviousForm}
                    >
                        Previous
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                    >
                        Next
                    </button>
                </div>
            </form>
        </div>
    );
}