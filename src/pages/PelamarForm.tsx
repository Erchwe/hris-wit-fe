import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from '../utils/api';
import { useNavigate } from "react-router-dom";


interface NullableString {
    String: string;
    Valid: boolean;
}

interface JobDetail {
    id_lowongan_pekerjaan: string;
    posisi: string;
    deskripsi: NullableString;
    kriteria: NullableString;
}


export default function PelamarForm() {
    const [searchParams] = useSearchParams();
    const idLowongan = searchParams.get("id");
    const navigate = useNavigate();

    const [job, setJob] = useState<JobDetail | null>(null);
    const [loading, setLoading] = useState(true);

    const handleRegistation = () => {
        navigate(`/pelamarForm/identitasDiri?id=${idLowongan}`);
    };


    useEffect(() => {
        async function fetchJob() {
            if (!idLowongan) return;
            try {
                const response = await api.get(`/lowongan/${idLowongan}`);
                setJob(response.data.data);
            } catch {
                alert("Gagal memuat detail lowongan");
            } finally {
                setLoading(false);
            }
        }
        fetchJob();
    }, [idLowongan]);

    if (loading) return <div>Loading...</div>;
    if (!job) return <div>Lowongan tidak ditemukan</div>;

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
            <h1 className="text-3xl font-bold mb-4">{job.posisi}</h1>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Job Description</h2>
                <p>{job.deskripsi.Valid ? job.deskripsi.String : "Tidak ada deskripsi tersedia."}</p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Job Requirements</h2>
                <p>{job.kriteria.Valid ? job.kriteria.String : "Tidak ada kriteria tersedia."}</p>
            </section>

            <button
                className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
                onClick={handleRegistation}
            >
                Registrasi Pelamar
            </button>
        </div>
    );
}
