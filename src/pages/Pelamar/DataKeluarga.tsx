import React, { useState } from "react";
import { useNavigate,useSearchParams } from "react-router-dom";
import { usePelamar } from "./Pelamar";

type Anak = {
    nama: string;
    jenis_kelamin: string;
    tempat_lahir: string;
    tgl_lahir: string;
    pendidikan_pekerjaan: string;
};

type SaudaraKandung = {
    nama_saudara_kandung: string;
    jenis_kelamin: string;
    tempat_lahir: string;
    tgl_lahir: string;
    pendidikan_pekerjaan: string;
};

export interface FormState {
    nama_istri_suami: string;
    jenis_kelamin: string;
    tempat_lahir: string;
    tgl_lahir: string;
    pendidikan_terakhir: string;
    pekerjaan_skrg: string;

    nama_ayah: string;
    pekerjaan_ayah: string;
    nama_ibu: string;
    pekerjaan_ibu: string;
    alamat_rumah: string;

    anak: Anak[];
    saudara_kandung: SaudaraKandung[];
}

const KeluargaForm = () => {
    const [form, setForm] = useState<FormState>({
        nama_istri_suami: "",
        jenis_kelamin: "Laki-laki",
        tempat_lahir: "",
        tgl_lahir: "",
        pendidikan_terakhir: "",
        pekerjaan_skrg: "",

        // Data Orang Tua
        nama_ayah: "",
        pekerjaan_ayah: "",
        nama_ibu: "",
        pekerjaan_ibu: "",

        // Alamat
        alamat_rumah: "",

        // Data Anak
        anak: [
            { nama: "", jenis_kelamin: "Laki-laki", tempat_lahir: "", tgl_lahir: "", pendidikan_pekerjaan: "" },
        ],

        // Data Saudara Kandung
        saudara_kandung: [
            { nama_saudara_kandung: "", jenis_kelamin: "Laki-laki", tempat_lahir: "", tgl_lahir: "", pendidikan_pekerjaan: "" },
        ],
    });

    const [searchParams] = useSearchParams();
    const idLowongan = searchParams.get("id");
    const { setData } = usePelamar();
    const navigate = useNavigate();

    const handlePreviousForm = () => {
        navigate(`/pelamarForm/IdentitasDiri?id=${idLowongan}`);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        setData(prev => ({
            ...prev,
            keluarga: form,
        }));

        navigate(`/pelamarForm/RiwayatPendidikan?id=${idLowongan}`);
    };

    const handleAddItem = (group: keyof Pick<FormState, "anak" | "saudara_kandung">) => {
        setForm((prev) => {
            let newItem;
            if (group === "anak") {
                newItem = { nama: "", jenis_kelamin: "Laki-laki", tempat_lahir: "", tgl_lahir: "", pendidikan_pekerjaan: "" };
            } else {
                newItem = { nama_saudara_kandung: "", jenis_kelamin: "Laki-laki", tempat_lahir: "", tgl_lahir: "", pendidikan_pekerjaan: "" };
            }

            return {
                ...prev,
                [group]: [...prev[group], newItem],
            };
        });
    };

    const handleRemoveItem = (index: number, group: keyof Pick<FormState, "anak" | "saudara_kandung">) => {
        setForm((prev) => {
            const updatedGroup = prev[group].filter((_, i) => i !== index);
            return { ...prev, [group]: updatedGroup };
        });
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        index?: number,
        group?: keyof Pick<FormState, "anak" | "saudara_kandung">
    ) => {
        const { name, value } = e.target;

        if (group && index !== undefined) {
            setForm((prevState) => {
                const updatedGroup = [...prevState[group]];
                updatedGroup[index] = { ...updatedGroup[index], [name]: value };
                return { ...prevState, [group]: updatedGroup };
            });
        } else {
            setForm((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        }
    };

    return (
        <div className="max-w-screen-lg mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Formulir Keluarga</h1>
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* --- Section: Istri/Suami --- */}
                <div className="border p-4 rounded-md space-y-4">
                    <h3 className="text-xl font-semibold">Data Istri/Suami</h3>
                    <div>
                        <label className="block font-medium mb-1">Nama Istri/Suami</label>
                        <input
                            name="nama_istri_suami"
                            placeholder="Nama Istri/Suami"
                            value={form.nama_istri_suami}
                            onChange={(e) => handleChange(e)}
                            className="w-full border px-3 py-2 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Jenis Kelamin</label>
                        <select
                            name="jenis_kelamin"
                            value={form.jenis_kelamin}
                            onChange={(e) => handleChange(e)}
                            className="w-full border px-3 py-2 rounded-md"
                        >
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                        </select>
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Pekerjaan Sekarang</label>
                        <input
                            name="pekerjaan_skrg"
                            placeholder="Pekerjaan Sekarang"
                            value={form.pekerjaan_skrg}
                            onChange={(e) => handleChange(e)}
                            className="w-full border px-3 py-2 rounded-md"
                        />
                    </div>
                </div>

                {/* --- Section: Orang Tua --- */}
                <div className="border p-4 rounded-md space-y-4">
                    <h3 className="text-xl font-semibold">Data Orang Tua</h3>
                    <div>
                        <label className="block font-medium mb-1">Nama Ayah</label>
                        <input
                            name="nama_ayah"
                            placeholder="Nama Ayah"
                            value={form.nama_ayah}
                            onChange={(e) => handleChange(e)}
                            className="w-full border px-3 py-2 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Pekerjaan Ayah</label>
                        <input
                            name="pekerjaan_ayah"
                            placeholder="Pekerjaan Ayah"
                            value={form.pekerjaan_ayah}
                            onChange={(e) => handleChange(e)}
                            className="w-full border px-3 py-2 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Nama Ibu</label>
                        <input
                            name="nama_ibu"
                            placeholder="Nama Ibu"
                            value={form.nama_ibu}
                            onChange={(e) => handleChange(e)}
                            className="w-full border px-3 py-2 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Pekerjaan Ibu</label>
                        <input
                            name="pekerjaan_ibu"
                            placeholder="Pekerjaan Ibu"
                            value={form.pekerjaan_ibu}
                            onChange={(e) => handleChange(e)}
                            className="w-full border px-3 py-2 rounded-md"
                        />
                    </div>
                </div>

                {/* --- Section: Anak --- */}
                <div>
                    <h3 className="text-xl font-semibold mb-2">Anak</h3>
                    {form.anak.map((anak, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-center mb-2">
                            <input
                                type="text"
                                name="nama"
                                placeholder="Nama Anak"
                                value={anak.nama}
                                onChange={(e) => handleChange(e, index, "anak")}
                                className="col-span-3 border px-3 py-2 rounded-md"
                            />
                            <select
                                name="jenis_kelamin"
                                value={anak.jenis_kelamin}
                                onChange={(e) => handleChange(e, index, "anak")}
                                className="col-span-2 border px-3 py-2 rounded-md"
                            >
                                <option value="Laki-laki">Laki-laki</option>
                                <option value="Perempuan">Perempuan</option>
                            </select>
                            <input
                                type="text"
                                name="tempat_lahir"
                                placeholder="Tempat Lahir"
                                value={anak.tempat_lahir}
                                onChange={(e) => handleChange(e, index, "anak")}
                                className="col-span-2 border px-3 py-2 rounded-md"
                            />
                            <input
                                type="date"
                                name="tgl_lahir"
                                value={anak.tgl_lahir}
                                onChange={(e) => handleChange(e, index, "anak")}
                                className="col-span-2 border px-3 py-2 rounded-md"
                            />
                            <input
                                type="text"
                                name="pendidikan_pekerjaan"
                                placeholder="Pendidikan/Pekerjaan"
                                value={anak.pendidikan_pekerjaan}
                                onChange={(e) => handleChange(e, index, "anak")}
                                className="col-span-2 border px-3 py-2 rounded-md"
                            />
                            <div className="col-span-1 text-center">
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index, "anak")}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={() => handleAddItem("anak")} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">+ Tambah Anak</button>
                </div>

                {/* --- Section: Saudara Kandung --- */}
                <div>
                    <h3 className="text-xl font-semibold mb-2">Saudara Kandung</h3>
                    {form.saudara_kandung.map((sdr, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-center mb-2">
                            <input
                                type="text"
                                name="nama_saudara_kandung"
                                placeholder="Nama Saudara"
                                value={sdr.nama_saudara_kandung}
                                onChange={(e) => handleChange(e, index, "saudara_kandung")}
                                className="col-span-3 border px-3 py-2 rounded-md"
                            />
                            <select
                                name="jenis_kelamin"
                                value={sdr.jenis_kelamin}
                                onChange={(e) => handleChange(e, index, "saudara_kandung")}
                                className="col-span-2 border px-3 py-2 rounded-md"
                            >
                                <option value="Laki-laki">Laki-laki</option>
                                <option value="Perempuan">Perempuan</option>
                            </select>
                            <input
                                type="text"
                                name="pendidikan_pekerjaan"
                                placeholder="Pendidikan/Pekerjaan"
                                value={sdr.pendidikan_pekerjaan}
                                onChange={(e) => handleChange(e, index, "saudara_kandung")}
                                className="col-span-3 border px-3 py-2 rounded-md"
                            />
                            <div className="col-span-1 text-center">
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index, "saudara_kandung")}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={() => handleAddItem("saudara_kandung")} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">+ Tambah Saudara</button>
                </div>

                {/* --- Section: Alamat --- */}
                <div className="border p-4 rounded-md">
                    <label className="block font-medium mb-1">Alamat Rumah Tempat Tinggal</label>
                    <input
                        type="text"
                        name="alamat_rumah"
                        placeholder="Alamat Rumah"
                        value={form.alamat_rumah}
                        onChange={(e) => handleChange(e)}
                        className="w-full border px-3 py-2 rounded-md"
                    />
                </div>

                {/* --- Tombol Navigasi --- */}
                <div className="mt-8 flex gap-4">
                    <button
                        type="button"
                        onClick={handlePreviousForm}
                        className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700">
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
};

export default KeluargaForm;
