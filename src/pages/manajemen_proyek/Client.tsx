import React, { useState, useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css'; 
import { toast, ToastContainer } from 'react-toastify';
import api from '../../utils/api.ts';

// --- INTERFACE ---
interface Client {
  client_id: string;
  client_name: { String: string; Valid: boolean };
  shipment_address: { String: string; Valid: boolean };
  billing_address: { String: string; Valid: boolean };
  created_at: string;
  created_by: string;
}

interface Project {
  project_id: string;
  client_id: string;
  project_status: any;
}

// --- FUNGSI HELPER ---
const decodeEnum = (data: any): string => {
  let valueToDecode = '';
  if (typeof data === 'string') {
    valueToDecode = data;
  } else if (data?.Valid && typeof data.String === 'string') {
    valueToDecode = data.String;
  }
  if (valueToDecode) {
    try { return atob(valueToDecode); } catch (e) { return valueToDecode; }
  }
  return '';
};

export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const [showInsertModal, setShowInsertModal] = useState<boolean>(false); 
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState({
    client_name: '',
    shipment_address: '',
    billing_address: '',
    created_by: 'admin',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientsResponse, projectsResponse] = await Promise.all([
        api.get(`/client`),
        api.get(`/project`),
      ]);
      setClients(clientsResponse.data.data || []);
      setProjects(projectsResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal mengambil data dari server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const handleEditClick = (client: Client) => {
    setCurrentClient(client);
    setShowEditModal(true);
  };
  
  const handleInsertClick = () => {
    // Reset dr insert
    setNewClient({
      client_name: '',
      shipment_address: '',
      billing_address: '',
      created_by: 'admin',
    });
    setShowInsertModal(true);
  };

  const handleCloseModals = () => {
    setShowInsertModal(false);
    setShowEditModal(false);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, formType: 'insert' | 'edit') => {
    const { name, value } = e.target;
    if (formType === 'insert') {
      setNewClient(prev => ({ ...prev, [name]: value }));
    } else if (currentClient) {
      setCurrentClient(prev => prev ? ({
        ...prev,
        [name]: { String: value, Valid: true }
      }) : null);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClient) return;
    try {
      const updatedData = {
        client_id: currentClient.client_id,
        client_name: currentClient.client_name.String,
        shipment_address: currentClient.shipment_address.String,
        billing_address: currentClient.billing_address.String,
        created_by: currentClient.created_by,
      };
      await api.put(`/client/${currentClient.client_id}`, updatedData);
      toast.success('Data klien berhasil diperbarui!');
      await fetchData(); 
      handleCloseModals();
    } catch (error) {
      console.error('Error memperbarui data klien:', error);
      toast.error('Gagal memperbarui data klien.');
    }
  };

  const handleInsertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/client`, newClient);
      toast.success('Berhasil menambahkan klien!');
      await fetchData(); 
      handleCloseModals();
    } catch (error) {
      console.error('Gagal menambahkan klien:', error);
      toast.error('Gagal menambahkan klien.');
    }
  };

  const handleDelete = async (clientId: string) => {
    if (!window.confirm(`Yakin ingin menghapus klien ${clientId}?`)) return;
    try {
      await api.delete(`/client/${clientId}`);
      setClients(prev => prev.filter(client => client.client_id !== clientId));
      toast.success('Klien berhasil dihapus!');
    } catch (error) {
      console.error('Error menghapus klien:', error);
      toast.error('Gagal menghapus klien.');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-2">Daftar Klien</h1>
      <button onClick={handleInsertClick} className="bg-blue-600 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700">
        Tambah Klien Baru
      </button>

      {/* Klien */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.length > 0 ? (
          clients.map(client => {
            // Hitung proyek untuk per klien
            const clientProjects = projects.filter(p => p.client_id === client.client_id);
            const activeProjects = clientProjects.filter(p => decodeEnum(p.project_status) !== 'done').length;
            const completedProjects = clientProjects.filter(p => decodeEnum(p.project_status) === 'done').length;

            return (
              <div key={client.client_id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <div className="p-5 flex-grow">
                  <p className="text-sm text-gray-400">{client.client_id}</p>
                  <h3 className="text-lg font-bold text-gray-800 truncate">{client.client_name.String}</h3>
                  <div className="text-sm text-gray-600 mt-2">
                    <p><strong>Alamat Pengiriman:</strong> {client.shipment_address.String || '-'}</p>
                    <p><strong>Alamat Penagihan:</strong> {client.billing_address.String || '-'}</p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-4">
                      <div className="text-center">
                          <p className="text-2xl font-bold text-yellow-500">{activeProjects}</p>
                          <p className="text-xs text-gray-500">Proyek Aktif</p>
                      </div>
                      <div className="text-center">
                          <p className="text-2xl font-bold text-green-500">{completedProjects}</p>
                          <p className="text-xs text-gray-500">Proyek Selesai</p>
                      </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3 flex justify-end space-x-2">
                  <button onClick={() => handleEditClick(client)} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600">Edit</button>
                  <button onClick={() => handleDelete(client.client_id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Delete</button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="col-span-full text-center text-gray-500">Tidak ada data klien ditemukan.</p>
        )}
      </div>
      <ToastContainer />

      {/* MODAL EDIT */}
      {showEditModal && currentClient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Edit Klien</h2>
            <form onSubmit={handleUpdateSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium">Nama Klien</label>
                <input type="text" name="client_name" value={currentClient.client_name.String} onChange={(e) => handleChange(e, 'edit')} className="w-full p-2 border border-gray-300 rounded" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Alamat Pengiriman</label>
                <input type="text" name="shipment_address" value={currentClient.shipment_address.String} onChange={(e) => handleChange(e, 'edit')} className="w-full p-2 border border-gray-300 rounded" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Alamat Penagihan</label>
                <input type="text" name="billing_address" value={currentClient.billing_address.String} onChange={(e) => handleChange(e, 'edit')} className="w-full p-2 border border-gray-300 rounded" />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={handleCloseModals} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INSERT */}
      {showInsertModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Tambah Klien Baru</h2>
            <form onSubmit={handleInsertSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium">Nama Klien</label>
                <input type="text" name="client_name" value={newClient.client_name} onChange={(e) => handleChange(e, 'insert')} className="w-full p-2 border border-gray-300 rounded" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Alamat Pengiriman</label>
                <input type="text" name="shipment_address" value={newClient.shipment_address} onChange={(e) => handleChange(e, 'insert')} className="w-full p-2 border border-gray-300 rounded" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Alamat Penagihan</label>
                <input type="text" name="billing_address" value={newClient.billing_address} onChange={(e) => handleChange(e, 'insert')} className="w-full p-2 border border-gray-300 rounded" required />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={handleCloseModals} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}