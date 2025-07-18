import { useState } from "react";
import api from '../../utils/api.ts';
import { useNavigate } from "react-router-dom";

export default function CreateRecruitment() {
    const navigate = useNavigate();
    const [posisi, setPosisi] = useState("");
    const [tglBuka, setTglBuka] = useState("");
    const [tglTutup, setTglTutup] = useState("");
    const [kriteria, setKriteria] = useState("");
    const [email, setEmail] = useState("");
    const [deskripsi, setDeskripsi] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (new Date(tglBuka) > new Date(tglTutup)) {
            alert("Tanggal buka lowongan tidak boleh lebih besar dari tanggal tutup.");
            return;
        }

        try {
            setLoading(true);

            await api.post("/lowongan/insert", {
                posisi,
                tgl_buka_lowongan: tglBuka,
                tgl_tutup_lowongan: tglTutup,
                kriteria,
                deskripsi,
            });

            alert("Lowongan pekerjaan berhasil dibuat!");

            // Reset form
            setPosisi("");
            setTglBuka("");
            setTglTutup("");
            setKriteria("");
            setEmail("");
            setDeskripsi("");

            navigate("/karyawan/recruitment");

        } catch (error: unknown) {
            let message = "Gagal membuat lowongan pekerjaan.";

            alert(message);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
            <h1 className="text-xl font-semibold mb-4">Buat Lowongan Pekerjaan</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Posisi */}
                <div>
                    <label htmlFor="posisi" className="block mb-1 font-medium">Posisi</label>
                    <input
                        id="posisi"
                        type="text"
                        value={posisi}
                        onChange={(e) => setPosisi(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        required
                    />
                </div>

                {/* Tanggal Buka */}
                <div>
                    <label htmlFor="tglBuka" className="block mb-1 font-medium">Tanggal Buka</label>
                    <input
                        id="tglBuka"
                        type="date"
                        value={tglBuka}
                        onChange={(e) => setTglBuka(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        required
                    />
                </div>

                {/* Tanggal Tutup */}
                <div>
                    <label htmlFor="tglTutup" className="block mb-1 font-medium">Tanggal Tutup</label>
                    <input
                        id="tglTutup"
                        type="date"
                        value={tglTutup}
                        onChange={(e) => setTglTutup(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        required
                    />
                </div>

                {/* Kriteria */}
                <div>
                    <label htmlFor="kriteria" className="block mb-1 font-medium">Kriteria</label>
                    <textarea
                        id="kriteria"
                        value={kriteria}
                        onChange={(e) => setKriteria(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        rows={3}
                    />
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="email" className="block mb-1 font-medium">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        required
                    />
                </div>

                {/* Deskripsi */}
                <div>
                    <label htmlFor="deskripsi" className="block mb-1 font-medium">Deskripsi</label>
                    <textarea
                        id="deskripsi"
                        value={deskripsi}
                        onChange={(e) => setDeskripsi(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        rows={4}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                    {loading ? "Menyimpan..." : "Buat Lowongan"}
                </button>
            </form>
        </div>
    );
}
