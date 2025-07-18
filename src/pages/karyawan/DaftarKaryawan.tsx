import { useEffect, useState } from 'react';
import api from '../../utils/api.ts';
import { Link } from 'react-router-dom';

// Type definitions

type NullableString = {
    String: string;
    Valid: boolean;
};

type NullableTime = {
    Time: string;
    Valid: boolean;
};

interface Pelamar {
    id: string;
    id_data_pelamar: string;
    nama_lengkap: string;
    status: string;
    tanggal?: NullableTime;
    no_ktp?: NullableString;
    tgl_lahir?: NullableTime;
    no_hp?: NullableString;
    posisi?: NullableString;
}

const statusStyles: Record<string, string> = {
    'New': 'bg-blue-100 text-blue-800',
    'Short list': 'bg-indigo-100 text-indigo-800',
    'HR Interview': 'bg-purple-100 text-purple-800',
    'User Interview': 'bg-purple-200 text-purple-900',
    'Psikotest': 'bg-yellow-100 text-yellow-800',
    'Refference Checking': 'bg-gray-100 text-gray-800',
    'Offering': 'bg-teal-100 text-teal-800',
    'Hired': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
};

export default function DaftarPelamar() {
    const [pelamarList, setPelamarList] = useState<Pelamar[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [newStatus, setNewStatus] = useState<string | null>(null);

    const fetchPelamar = async () => {
        try {
            const res = await api.get('/pelamar');
            if (Array.isArray(res.data.data)) {
                setPelamarList(res.data.data);
            } else {
                console.error("Format data tidak sesuai:", res.data);
            }
        } catch (err) {
            console.error('Gagal mengambil data pelamar:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPelamar();
    }, []);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(pelamarList.map(p => p.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
        );
    };

    const updateStatusPelamar = () => {
        if (selectedIds.length === 0) {
            alert("Pilih minimal satu pelamar terlebih dahulu.");
            return;
        }
        setShowModal(true);
    };

    const handleConfirmStatusUpdate = async () => {
        if (!newStatus) {
            alert("Pilih status terlebih dahulu.");
            return;
        }
        const uniqueIdsToUpdate = pelamarList
            .filter(p => selectedIds.includes(p.id))
            .map(p => p.id_data_pelamar);

        try {
            await api.put(
                '/pelamar/update-status',
                {
                    ids: uniqueIdsToUpdate,
                    status: btoa(newStatus),
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            alert('Status berhasil diperbarui.');
            await fetchPelamar();
            setSelectedIds([]);
        } catch (error) {
            console.error('Gagal update status:', error);
            alert('Gagal update status.');
        } finally {
            setShowModal(false);
            setNewStatus(null);
        }
    };

    const formatString = (value?: NullableString) => {
        return value?.Valid ? value.String : '-';
    };

    const formatDate = (dateValue?: NullableTime) => {
        if (dateValue?.Valid && dateValue.Time && !dateValue.Time.startsWith('0001-01-01')) {
            const datePart = dateValue.Time.split('T')[0];
            return new Date(datePart).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }
        return '-';
    };

    if (loading) {
        return <div className="p-6">Memuat data...</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold text-gray-800">Pelamar</h1>
            <p className="text-sm text-gray-500 mb-6">Data Pelamar</p>

            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col md:flex-row items-center justify-between mb-4">
                    <div className="flex gap-2 mb-4 md:mb-0">
                        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50">Export</button>
                        <button onClick={updateStatusPelamar} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Ubah Status Pelamar</button>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-red-600 rounded-md hover:bg-red-700">Hapus</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <select className="w-full border px-3 py-2 rounded-md bg-gray-50"><option>Pilih Lowongan</option></select>
                    <input type="date" className="w-full border px-3 py-2 rounded-md bg-gray-50" />
                    <input type="date" className="w-full border px-3 py-2 rounded-md bg-gray-50" />
                    <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 w-full">Filter</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase">
                        <tr>
                            <th className="p-4 w-4"><input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === pelamarList.length && pelamarList.length > 0} /></th>
                            <th className="p-4">Tanggal</th>
                            <th className="p-4">No. KTP</th>
                            <th className="p-4">Nama Pelamar</th>
                            <th className="p-4">Tanggal Lahir</th>
                            <th className="p-4">No. HP</th>
                            <th className="p-4">Posisi</th>
                            <th className="p-4">Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {pelamarList.map((pelamar) => {
                            const decodedStatus = atob(pelamar.status);
                            const formattedTanggal = formatDate(pelamar.tanggal);
                            return (
                                <tr key={pelamar.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4"><input type="checkbox" checked={selectedIds.includes(pelamar.id)} onChange={() => handleSelectRow(pelamar.id)} /></td>
                                    <td className="p-4">{formattedTanggal !== '-' ? formattedTanggal : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                    <td className="p-4">{formatString(pelamar.no_ktp)}</td>
                                    <td className="p-4 font-medium text-gray-900">
                                        <Link to={`/pelamarForm/DetailKaryawan/${pelamar.id_data_pelamar}`} className="text-blue-600 hover:underline">
                                            {pelamar.nama_lengkap || '-'}
                                        </Link>
                                    </td>
                                    <td className="p-4">{formatDate(pelamar.tgl_lahir)}</td>
                                    <td className="p-4">{formatString(pelamar.no_hp)}</td>
                                    <td className="p-4">{formatString(pelamar.posisi)}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[decodedStatus] || 'bg-gray-100 text-gray-800'}`}>{decodedStatus}</span>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                    <span>Menampilkan 1-{pelamarList.length} dari {pelamarList.length} data</span>
                    <div className="flex items-center gap-2">
                        <button className="px-2 py-1 border rounded hover:bg-gray-100">Awal</button>
                        <button className="px-2 py-1 border rounded hover:bg-gray-100">Mundur</button>
                        <span className="px-3 py-1 bg-blue-600 text-white rounded">1</span>
                        <button className="px-2 py-1 border rounded hover:bg-gray-100">Maju</button>
                        <button className="px-2 py-1 border rounded hover:bg-gray-100">Akhir</button>
                    </div>
                </div>
            </div>

            {/* Modal untuk update status */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Update Status Pelamar</h3>
                        <div className="space-y-2">
                            <label htmlFor="status-select" className="block text-sm font-medium text-gray-700">Status</label>
                            <select id="status-select" value={newStatus || ''} onChange={(e) => setNewStatus(e.target.value)} className="w-full border px-3 py-2 rounded-md bg-gray-50">
                                <option value="" disabled>Pilih status baru</option>
                                {Object.keys(statusStyles).map(status => (<option key={status} value={status}>{status}</option>))}
                            </select>
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50">Batal</button>
                            <button type="button" onClick={handleConfirmStatusUpdate} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Ubah</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}