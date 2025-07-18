import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from '../../utils/api.ts';

interface NullableString {
    String: string;
    Valid: boolean;
}

interface JobDetail {
    id_lowongan_pekerjaan: string;
    posisi: string;
    tgl_buka_lowongan: string;
    tgl_tutup_lowongan: string;
    kriteria: NullableString;
    deskripsi: NullableString;
    link_lowongan: NullableString;
}

export default function EditRecruitment() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [posisi, setPosisi] = useState("");
    const [tglBuka, setTglBuka] = useState("");
    const [tglTutup, setTglTutup] = useState("");
    const [kriteria, setKriteria] = useState("");
    const [deskripsi, setDeskripsi] = useState("");
    const [linkLowongan, setLinkLowongan] = useState("");

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchJob() {
            try {
                const response = await api.get(`/lowongan/${id}`);
                const job: JobDetail = response.data.data;

                setPosisi(job.posisi);
                setTglBuka(job.tgl_buka_lowongan === "0001-01-01T00:00:00Z" ? "" : job.tgl_buka_lowongan.split("T")[0]);
                setTglTutup(job.tgl_tutup_lowongan === "0001-01-01T00:00:00Z" ? "" : job.tgl_tutup_lowongan.split("T")[0]);
                setKriteria(job.kriteria.Valid ? job.kriteria.String : "");
                setDeskripsi(job.deskripsi.Valid ? job.deskripsi.String : "");
                setLinkLowongan(job.link_lowongan.Valid ? job.link_lowongan.String : "");
            } catch {
                alert("Gagal load data lowongan");
                navigate("/karyawan/recruitment");
            } finally {
                setLoading(false);
            }
        }
        fetchJob();
    }, [id, navigate]);

    if (loading) return <div>Loading...</div>;

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await api.put(`/lowongan/${id}`, {
                posisi,
                tgl_buka_lowongan: tglBuka,
                tgl_tutup_lowongan: tglTutup,
                kriteria,
                deskripsi,
                link_lowongan: linkLowongan,
            });

            alert("Lowongan berhasil diperbarui");
            navigate("/karyawan/recruitment");
        } catch (err) {
            alert("Gagal memperbarui lowongan");
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Update Lowongan Pekerjaan</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
                {/* Posisi */}
                <div>
                    <label htmlFor="posisi" className="block font-medium mb-1">
                        Posisi
                    </label>
                    <input
                        type="text"
                        id="posisi"
                        className="w-full border rounded px-3 py-2"
                        value={posisi}
                        onChange={(e) => setPosisi(e.target.value)}
                        required
                    />
                </div>

                {/* Tgl Buka */}
                <div>
                    <label htmlFor="tglBuka" className="block font-medium mb-1">
                        Tanggal Buka Lowongan
                    </label>
                    <input
                        type="date"
                        id="tglBuka"
                        className="w-full border rounded px-3 py-2"
                        value={tglBuka}
                        onChange={(e) => setTglBuka(e.target.value)}
                        required
                    />
                </div>

                {/* Tgl Tutup */}
                <div>
                    <label htmlFor="tglTutup" className="block font-medium mb-1">
                        Tanggal Tutup Lowongan
                    </label>
                    <input
                        type="date"
                        id="tglTutup"
                        className="w-full border rounded px-3 py-2"
                        value={tglTutup}
                        onChange={(e) => setTglTutup(e.target.value)}
                        required
                    />
                </div>

                {/* Kriteria */}
                <div>
                    <label htmlFor="kriteria" className="block font-medium mb-1">
                        Kriteria
                    </label>
                    <textarea
                        id="kriteria"
                        className="w-full border rounded px-3 py-2"
                        rows={3}
                        value={kriteria}
                        onChange={(e) => setKriteria(e.target.value)}
                    />
                </div>

                {/* Deskripsi */}
                <div>
                    <label htmlFor="deskripsi" className="block font-medium mb-1">
                        Deskripsi
                    </label>
                    <textarea
                        id="deskripsi"
                        className="w-full border rounded px-3 py-2"
                        rows={3}
                        value={deskripsi}
                        onChange={(e) => setDeskripsi(e.target.value)}
                    />
                </div>

                {/* Link Lowongan */}
                <div>
                    <label htmlFor="linkLowongan" className="block font-medium mb-1">
                        Link Lowongan
                    </label>
                    <input
                        id="linkLowongan"
                        className="w-full border rounded px-3 py-2"
                        value={linkLowongan}
                        onChange={(e) => setLinkLowongan(e.target.value)}
                    />
                </div>

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("/karyawan/recruitment")}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Simpan
                    </button>
                </div>
            </form>
        </div>
    );
}
