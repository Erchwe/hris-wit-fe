import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../utils/api.ts';

interface NullableString {
    String: string;
    Valid: boolean;
}

interface Job {
    id_lowongan_pekerjaan: string;
    posisi: string;
    tgl_buka_lowongan: string;
    tgl_tutup_lowongan: string;
    kriteria: NullableString;
    deskripsi: NullableString;
    link_lowongan: NullableString;
}

export default function Recruitment() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<Job[]>([]);

    useEffect(() => {
        async function fetchJobs() {
            try {
                const response = await api.get("/lowongan");
                setJobs(response.data.data);
            } catch (error) {
                console.error("Gagal load data lowongan", error);
            }
        }
        fetchJobs();
    }, []);

    const handleCreate = () => {
        navigate("/karyawan/createRecruitment");
    };

    const handleDetail = (id: string) => {
        navigate(`/karyawan/recruitment/${id}`);
    };

    return (
        <div className="max-w-screen-lg mx-auto px-4 py-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-semibold text-gray-800">Lowongan Pekerjaan</h1>
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow transition duration-300"
                    onClick={handleCreate}
                >
                    + Buat Lowongan
                </button>
            </div>

            <div className="overflow-x-auto rounded-lg shadow border">
                <table className="min-w-full table-auto bg-white">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-700 border-b">Posisi</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700 border-b">Dari Tanggal</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700 border-b">Sampai Tanggal</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700 border-b">Link Share</th>
                    </tr>
                    </thead>
                    <tbody>
                    {jobs.map((job, idx) => (
                        <tr
                            key={job.id_lowongan_pekerjaan}
                            className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                            <td
                                className="px-4 py-3 text-blue-600 underline cursor-pointer border-b"
                                onClick={() => handleDetail(job.id_lowongan_pekerjaan)}
                            >
                                {job.posisi}
                            </td>
                            <td className="px-4 py-3 border-b">
                                {job.tgl_buka_lowongan === "0001-01-01T00:00:00Z" ? "-" :
                                    new Date(job.tgl_buka_lowongan).toISOString().split("T")[0]}
                            </td>
                            <td className="px-4 py-3 border-b">
                                {job.tgl_tutup_lowongan === "0001-01-01T00:00:00Z" ? "-" :
                                    new Date(job.tgl_tutup_lowongan).toISOString().split("T")[0]}
                            </td>
                            <td className="px-4 py-3 border-b">
                                {job.link_lowongan?.Valid ? (
                                    <a
                                        href={job.link_lowongan.String}
                                        className="text-blue-500 underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {job.link_lowongan.String}
                                    </a>
                                ) : (
                                    "-"
                                )}
                            </td>

                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
