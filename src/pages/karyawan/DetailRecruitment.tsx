  import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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

export default function DetailRecruitment() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [job, setJob] = useState<JobDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDetail() {
            try {
                const response = await api.get(`/lowongan/${id}`);
                setJob(response.data.data);
            } catch (error) {
                console.error("Gagal load detail lowongan", error);
            } finally {
                setLoading(false);
            }
        }

        fetchDetail();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!job) return <div>Data tidak ditemukan</div>;

    return (
        <div className="p-6 max-w-xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">{job.posisi}</h2>

            <div><strong>Dari Tanggal:</strong> {job.tgl_buka_lowongan === "0001-01-01T00:00:00Z" ? "-" : new Date(job.tgl_buka_lowongan).toISOString().split("T")[0]}</div>
            <div><strong>Sampai Tanggal:</strong> {job.tgl_tutup_lowongan === "0001-01-01T00:00:00Z" ? "-" : new Date(job.tgl_tutup_lowongan).toISOString().split("T")[0]}</div>
            <div><strong>Kriteria:</strong> {job.kriteria.Valid ? job.kriteria.String : "-"}</div>
            <div><strong>Deskripsi:</strong> {job.deskripsi.Valid ? job.deskripsi.String : "-"}</div>
            <div>
                <strong>Link Lowongan:</strong>{" "}
                {job.link_lowongan.Valid ? (
                    <a href={job.link_lowongan.String} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        {job.link_lowongan.String}
                    </a>
                ) : (
                    "-"
                )}
            </div>

            {/* Buttons */}
            <div className="space-x-4 mt-6">
                <button
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    onClick={() => navigate(-1)} // kembali
                >
                    Kembali
                </button>
                <button
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                    onClick={() => navigate(`/karyawan/recruitment/update/${job.id_lowongan_pekerjaan}`)}
                >
                    Update
                </button>
                <button
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    onClick={async () => {
                        if (window.confirm("Yakin ingin menghapus lowongan ini?")) {
                            try {
                                await api.delete(`/lowongan/${job.id_lowongan_pekerjaan}`);
                                alert("Lowongan berhasil dihapus");
                                navigate("/karyawan/recruitment");
                            } catch (error) {
                                alert("Gagal menghapus lowongan");
                            }
                        }
                    }}
                >
                    Hapus
                </button>
            </div>
        </div>
    );
}
