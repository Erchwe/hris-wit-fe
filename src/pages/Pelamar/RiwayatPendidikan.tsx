import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {usePelamar} from "./Pelamar.tsx";

export interface PendidikanFormal {
    jenjang_pddk: string;
    nama_sekolah: string;
    jurusan_fakultas: string;
    kota: string;
    tgl_lulus: string;
    ipk: number;
}

export interface PendidikanNonFormal {
    institusi: string;
    jenis_pendidikan: string;
    kota: string;
    tgl_lulus: string;
}

export interface PenguasaanBahasa {
    bahasa: string;
    lisan: string;
    tulisan: string;
    keterangan: string;
}

export default function RiwayatPendidikan() {
    const [pendFormal, setPendFormal] = useState<PendidikanFormal[]>([
        { jenjang_pddk: "", nama_sekolah: "", jurusan_fakultas: "", kota: "", tgl_lulus: "", ipk: 0 },
    ]);

    const [pendNonFormal, setPendNonFormal] = useState<PendidikanNonFormal[]>([
        { institusi: "", jenis_pendidikan: "", kota: "", tgl_lulus: "" },
    ]);

    const [bahasa, setBahasa] = useState<PenguasaanBahasa[]>([
        { bahasa: "", lisan: "", tulisan: "", keterangan: "" },
    ]);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const idLowongan = searchParams.get("id");

    const handleChange = <T,>(
        index: number,
        field: keyof T,
        value: string | number, // Izinkan tipe number untuk IPK
        groupSetter: React.Dispatch<React.SetStateAction<T[]>>
    ) => {
        groupSetter((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value } as T;
            return updated;
        });
    };

    const handleAdd = <T,>(groupSetter: React.Dispatch<React.SetStateAction<T[]>>, initial: T) => {
        groupSetter((prev) => [...prev, initial]);
    };

    const handleRemove = <T,>(index: number, groupSetter: React.Dispatch<React.SetStateAction<T[]>>) => {
        groupSetter((prev) => prev.filter((_, i) => i !== index));
    };

    const handlePreviousForm = () => {
        navigate(`/pelamarForm/dataKeluarga?id=${idLowongan}`);
    };

    const { setData } = usePelamar();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        setData(prev => ({
            ...prev,
            pendidikan: {
                formal: pendFormal,
                nonFormal: pendNonFormal,
                bahasa: bahasa,
            }
        }));

        navigate(`/pelamarForm/PengalamanKerja?id=${idLowongan}`);
    };

    const handleIpkChange = (index: number, value: string) => {
        const numericValue = parseFloat(value) || 0;
        handleChange(index, "ipk", numericValue, setPendFormal);
    };

    return (
        <div className="space-y-10 px-4 max-w-screen-lg mx-auto py-8">
            <form onSubmit={handleSubmit}>
                {/* --- Pendidikan Formal --- */}
                <section>
                    <h2 className="text-2xl font-bold mb-4">Riwayat Pendidikan Formal</h2>
                    {pendFormal.map((item, index) => (
                        <div key={index} className="border p-4 rounded-md space-y-4 mb-4 relative">
                            <input className="input w-full" placeholder="Jenjang Pendidikan" value={item.jenjang_pddk}
                                   onChange={(e) => handleChange(index, "jenjang_pddk", e.target.value, setPendFormal)} />
                            <input className="input w-full" placeholder="Nama Sekolah" value={item.nama_sekolah}
                                   onChange={(e) => handleChange(index, "nama_sekolah", e.target.value, setPendFormal)} />
                            <input className="input w-full" placeholder="Jurusan/Fakultas" value={item.jurusan_fakultas}
                                   onChange={(e) => handleChange(index, "jurusan_fakultas", e.target.value, setPendFormal)} />
                            <input className="input w-full" placeholder="Kota" value={item.kota}
                                   onChange={(e) => handleChange(index, "kota", e.target.value, setPendFormal)} />
                            <input type="date" className="input w-full" placeholder="Tanggal Lulus" value={item.tgl_lulus}
                                   onChange={(e) => handleChange(index, "tgl_lulus", e.target.value, setPendFormal)} />
                            <input type="number" step="0.01" className="input w-full" placeholder="IPK"  value={item.ipk === 0 ? '' : item.ipk}
                                   onChange={(e) => handleIpkChange(index, e.target.value)} />

                            {pendFormal.length > 1 && (
                                <button type="button" className="absolute top-2 right-2 text-red-500 text-sm hover:underline" onClick={() => handleRemove(index, setPendFormal)}>🗑️ Hapus</button>
                            )}
                        </div>
                    ))}
                    <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() =>
                        handleAdd(setPendFormal, { jenjang_pddk: "", nama_sekolah: "", jurusan_fakultas: "", kota: "", tgl_lulus: "", ipk: 0 })
                    }>
                        + Tambah Pendidikan Formal
                    </button>
                </section>

                {/* --- Pendidikan Non Formal --- */}
                <section className="mt-10">
                    <h2 className="text-2xl font-bold mb-4">Pendidikan Non-Formal</h2>
                    {pendNonFormal.map((item, index) => (
                        <div key={index} className="border p-4 rounded-md space-y-4 mb-4 relative">
                            <input className="input w-full" placeholder="Institusi" value={item.institusi}
                                   onChange={(e) => handleChange(index, "institusi", e.target.value, setPendNonFormal)} />
                            <input className="input w-full" placeholder="Jenis Pendidikan" value={item.jenis_pendidikan}
                                   onChange={(e) => handleChange(index, "jenis_pendidikan", e.target.value, setPendNonFormal)} />
                            <input className="input w-full" placeholder="Kota" value={item.kota}
                                   onChange={(e) => handleChange(index, "kota", e.target.value, setPendNonFormal)} />
                            <input type="date" className="input w-full" placeholder="Tanggal Lulus" value={item.tgl_lulus}
                                   onChange={(e) => handleChange(index, "tgl_lulus", e.target.value, setPendNonFormal)} />
                            {pendNonFormal.length > 1 && (
                                <button type="button" className="absolute top-2 right-2 text-red-500 text-sm hover:underline" onClick={() => handleRemove(index, setPendNonFormal)}>🗑️ Hapus</button>
                            )}
                        </div>
                    ))}
                    <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() =>
                        handleAdd(setPendNonFormal, { institusi: "", jenis_pendidikan: "", kota: "", tgl_lulus: "" })
                    }>
                        + Tambah Pendidikan Non-Formal
                    </button>
                </section>

                {/* --- Penguasaan Bahasa --- */}
                <section className="mt-10">
                    <h2 className="text-2xl font-bold mb-4">Penguasaan Bahasa</h2>
                    {bahasa.map((item, index) => (
                        <div key={index} className="border p-4 rounded-md space-y-4 mb-4 relative">
                            <input className="input w-full" placeholder="Bahasa" value={item.bahasa}
                                   onChange={(e) => handleChange(index, "bahasa", e.target.value, setBahasa)} />
                            <input className="input w-full" placeholder="Lisan" value={item.lisan}
                                   onChange={(e) => handleChange(index, "lisan", e.target.value, setBahasa)} />
                            <input className="input w-full" placeholder="Tulisan" value={item.tulisan}
                                   onChange={(e) => handleChange(index, "tulisan", e.target.value, setBahasa)} />
                            <input className="input w-full" placeholder="Keterangan" value={item.keterangan}
                                   onChange={(e) => handleChange(index, "keterangan", e.target.value, setBahasa)} />
                            {bahasa.length > 1 && (
                                <button type="button" className="absolute top-2 right-2 text-red-500 text-sm hover:underline" onClick={() => handleRemove(index, setBahasa)}>🗑️ Hapus</button>
                            )}
                        </div>
                    ))}
                    <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() =>
                        handleAdd(setBahasa, { bahasa: "", lisan: "", tulisan: "", keterangan: "" })
                    }>
                        + Tambah Bahasa
                    </button>
                </section>

                <div className="mt-8 flex gap-4">
                    <button
                        type="button"
                        className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700" onClick={handlePreviousForm}>
                        Previous
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                        Next
                    </button>
                </div>
            </form>
        </div>
    );
}

