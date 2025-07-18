import React, { useState, useEffect, useMemo } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { AxiosResponse } from 'axios'; // <-- Penting: Impor tipe AxiosResponse
import api from '../../utils/api';

// --- INTERFACE ---
interface Project {
  project_id: string;
  client_id: string;
  project_name: { String: string; Valid: boolean };
  project_desc: { String: string; Valid: boolean };
  project_status: any;
  project_priority: any;
  project_color: { String: string; Valid: boolean };
  start_date: { Time: string; Valid: boolean };
  due_date: { Time: string; Valid: boolean };
  created_at: string;
  created_by: string;
}

interface Client {
  client_id: string;
  client_name: { String: string; Valid: boolean };
}

interface List {
  list_id: string;
  project_id: string;
}

interface Task {
  task_id: string;
  list_id: string;
  task_status: any;
}

interface ProjectFormData {
  client_id: string;
  project_name: string;
  project_desc: string;
  project_status: string;
  project_priority: string;
  project_color: string;
  start_date: string;
  due_date: string;
}

// --- Tipe data baru utk sorting ---
type SortableKeys = 'project_id' | 'project_status' | 'project_priority' | 'start_date' | 'due_date';
interface SortConfig {
  key: SortableKeys | null;
  direction: 'ascending' | 'descending';
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
    try {
      return atob(valueToDecode);
    } catch (e) {
      const knownPlainTextValues = ['low', 'medium', 'high', 'crucial', 'open', 'on progress', 'done'];
      if (knownPlainTextValues.includes(valueToDecode)) {
        return valueToDecode;
      }
      return '';
    }
  }
  return '';
};

const formatDate = (dateObj: { Time: string; Valid: boolean } | undefined) => {
  if (dateObj?.Valid && dateObj.Time) {
    return new Date(dateObj.Time).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
  return 'N/A';
};

export default function Proyek() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [showInsertModal, setShowInsertModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const [insertFormData, setInsertFormData] = useState<ProjectFormData>({
    client_id: '', project_name: '', project_desc: '',
    project_status: '', project_priority: '',
    project_color: '#4f46e5', start_date: '', due_date: '',
  });
  const [editFormData, setEditFormData] = useState<ProjectFormData | null>(null);

  const [sortConfig] = useState<SortConfig>({ key: null, direction: 'ascending' });

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [projectsResponse, clientsResponse, tasksResponse] = await Promise.all([
        api.get('/project'),
        api.get('/client'),
        api.get('/task')
      ]);

      // Karena api.ts adalah axios, akses data melalui .data.data
      const fetchedProjects: Project[] = projectsResponse.data.data || [];
      const clientData: Client[] = clientsResponse.data.data || [];

      setProjects(fetchedProjects);
      setClients(clientData);
      setTasks(tasksResponse.data.data || []);

      if (clientData.length > 0 && !insertFormData.client_id) {
        setInsertFormData(prev => ({ ...prev, client_id: clientData[0].client_id }));
      }

      if (fetchedProjects.length > 0) {
        const listPromises = fetchedProjects.map(project =>
            api.get(`/project/${project.project_id}/lists`)
        );

        const listResults = await Promise.allSettled(listPromises);

        // Type guard yang benar untuk wrapper axios
        const allLists: List[] = listResults
            .filter(
                (result): result is PromiseFulfilledResult<AxiosResponse<{ data: List[] }>> =>
                    result.status === 'fulfilled' && !!result.value.data?.data
            )
            .flatMap(result => result.value.data.data);

        setLists(allLists);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal mengambil data!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (currentProject) {
      setEditFormData({
        client_id: currentProject.client_id,
        project_name: currentProject.project_name?.String || '',
        project_desc: currentProject.project_desc?.String || '',
        project_status: decodeEnum(currentProject.project_status),
        project_priority: decodeEnum(currentProject.project_priority),
        project_color: currentProject.project_color?.String || '#4f46e5',
        start_date: currentProject.start_date?.Valid ? currentProject.start_date.Time.split('T')[0] : '',
        due_date: currentProject.due_date?.Valid ? currentProject.due_date.Time.split('T')[0] : '',
      });
      setShowEditModal(true);
    } else {
      setEditFormData(null);
    }
  }, [currentProject]);

  const handleOpenClick = (projectId: string) => navigate(`/manajemen_proyek/project/${projectId}`);

  const handleFormChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
      formType: 'insert' | 'edit'
  ) => {
    const { name, value } = e.target;
    if (formType === 'insert') {
      setInsertFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setEditFormData((prev) =>
          prev ? { ...prev, [name]: value } : null
      );
    }
  };

  const handleInsertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...insertFormData,
      project_status: insertFormData.project_status ? btoa(insertFormData.project_status) : '',
      project_priority: insertFormData.project_priority ? btoa(insertFormData.project_priority) : '',
      created_by: 'admin',
    };
    try {
      await api.post('/project', payload);
      fetchAllData();
      setShowInsertModal(false);
      toast.success('Proyek baru berhasil dibuat!');
    } catch (error) {
      console.error('Error membuat proyek:', error);
      toast.error('Gagal membuat proyek baru!');
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData || !currentProject) return;

    const payload = {
      ...editFormData,
      project_id: currentProject.project_id,
      project_status: editFormData.project_status ? btoa(editFormData.project_status) : '',
      project_priority: editFormData.project_priority ? btoa(editFormData.project_priority) : '',
      updated_by: 'admin_edit',
    };

    try {
      await api.put(`/project/${currentProject.project_id}`, payload);
      fetchAllData();
      setShowEditModal(false);
      toast.success('Proyek berhasil diupdate!');
    } catch (error) {
      console.error('Error memperbarui proyek:', error);
      toast.error('Gagal memperbarui proyek!');
    }
  };

  const handleDelete = async (project_id: string) => {
    if (!window.confirm(`Yakin ingin menghapus proyek ${project_id}?`)) return;
    try {
      await api.delete(`/project/${project_id}`);
      setProjects(prev => prev.filter(p => p.project_id !== project_id));
      toast.success('Proyek berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Gagal menghapus proyek!');
    }
  };

  const sortedProjects = useMemo(() => {
    let sortableItems = [...projects];
    const { key, direction } = sortConfig;

    if (key) {
      const sortKey = key;
      sortableItems.sort((a, b) => {
        let aValue: any;
        let bValue: any;
        switch (sortKey) {
          case 'project_status':
          case 'project_priority':
            aValue = decodeEnum(a[sortKey]);
            bValue = decodeEnum(b[sortKey]);
            break;
          case 'start_date':
          case 'due_date':
            aValue = a[sortKey]?.Valid ? new Date(a[sortKey].Time).getTime() : 0;
            bValue = b[sortKey]?.Valid ? new Date(b[sortKey].Time).getTime() : 0;
            break;
          default:
            aValue = a[sortKey];
            bValue = b[sortKey];
            break;
        }
        if (aValue < bValue) return direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [projects, sortConfig]);

  if (loading) return <div>Loading...</div>;

  return (
      <div className="w-full">
        <h1 className="text-2xl font-bold mb-2">Daftar Proyek</h1>
        <button onClick={() => setShowInsertModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700">
          Tambah Proyek Baru
        </button>

        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProjects.length > 0 ? (
                sortedProjects.map((project) => {
                  const listsInProject = lists.filter(l => l.project_id === project.project_id);
                  const listIdsInProject = listsInProject.map(l => l.list_id);
                  const tasksInProject = tasks.filter(task => listIdsInProject.includes(task.list_id));
                  const doneTasksCount = tasksInProject.filter(task => decodeEnum(task.task_status) === 'done').length;

                  let progress = 0;
                  if (tasksInProject.length > 0) {
                    progress = Math.round((doneTasksCount / tasksInProject.length) * 100);
                  }

                  const projectStatus = decodeEnum(project.project_status);

                  return (
                      <div key={project.project_id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col" style={{ borderTop: `4px solid ${project.project_color?.String || '#ccc'}` }}>
                        <div className="p-5 flex-grow">
                          <div className="mb-3">
                            <p className="text-sm text-gray-500">{project.project_id}</p>
                            <h3 className="text-lg font-bold text-gray-800 truncate">{project.project_name.String}</h3>
                            <p className="text-sm text-gray-600 font-medium">{clients.find(c => c.client_id === project.client_id)?.client_name.String || 'N/A'}</p>
                          </div>

                          <div className="flex items-center space-x-2 mb-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${projectStatus === 'done' ? 'bg-green-100 text-green-800' :
                          projectStatus === 'on progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {projectStatus || 'N/A'}
                      </span>
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-800">
                        {decodeEnum(project.project_priority) || 'N/A'}
                      </span>
                          </div>

                          <div className="mb-2">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Progress ({doneTasksCount}/{tasksInProject.length} tasks)</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div className="bg-green-600 h-2.5 rounded-full transition-width duration-500" style={{ width: `${progress}%` }}></div>
                            </div>
                          </div>

                          <div className="flex justify-between text-xs text-gray-500 mt-3">
                            <span>Start: {formatDate(project.start_date)}</span>
                            <span>Due: {formatDate(project.due_date)}</span>
                          </div>
                        </div>

                        <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-end space-x-2">
                          <button onClick={() => handleOpenClick(project.project_id)} className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">Open</button>
                          <button onClick={() => setCurrentProject(project)} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600">Edit</button>
                          <button onClick={() => handleDelete(project.project_id)} className="bg-red-500 text-white px-3 py-1 rounded ml-2 text-sm hover:bg-red-600">Delete</button>
                        </div>
                      </div>
                  );
                })
            ) : (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-10">
                  <p className="text-gray-500">Tidak ada data proyek untuk ditampilkan.</p>
                </div>
            )}
          </div>
          <ToastContainer />
        </div>

        {showInsertModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-lg">
                <h2 className="text-xl font-semibold mb-4">Tambah Proyek Baru</h2>
                <form onSubmit={handleInsertSubmit}>
                  <div className="mb-4">
                    <label htmlFor="project_name" className="block text-sm font-medium">Nama Proyek</label>
                    <input type="text" id="project_name" name="project_name" value={insertFormData.project_name} onChange={(e) => handleFormChange(e, 'insert')} className="w-full p-2 border border-gray-300 rounded" required />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="project_desc" className="block text-sm font-medium">Deskripsi Proyek</label>
                    <input type="text" id="project_desc" name="project_desc" value={insertFormData.project_desc} onChange={(e) => handleFormChange(e, 'insert')} className="w-full p-2 border border-gray-300 rounded" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="project_color" className="block text-sm font-medium">Warna Proyek</label>
                    <input type="color" id="project_color" name="project_color" value={insertFormData.project_color} onChange={(e) => handleFormChange(e, 'insert')} className="w-full h-10 border border-gray-300 rounded" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="client_id" className="block text-sm font-medium">Client</label>
                    <select id="client_id" name="client_id" value={insertFormData.client_id} onChange={(e) => handleFormChange(e, 'insert')} className="w-full p-2 border border-gray-300 rounded" required>
                      <option value="" disabled>Pilih Client</option>
                      {clients.map(client => (<option key={client.client_id} value={client.client_id}>{client.client_name.String}</option>))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label htmlFor="start_date" className="block text-sm font-medium">Start Date</label>
                      <input type="date" id="start_date" name="start_date" value={insertFormData.start_date} onChange={(e) => handleFormChange(e, 'insert')} className="w-full p-2 border border-gray-300 rounded" />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="due_date" className="block text-sm font-medium">Due Date</label>
                      <input type="date" id="due_date" name="due_date" value={insertFormData.due_date} onChange={(e) => handleFormChange(e, 'insert')} className="w-full p-2 border border-gray-300 rounded" />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <button type="button" onClick={() => setShowInsertModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Simpan</button>
                  </div>
                </form>
              </div>
            </div>
        )}

        {showEditModal && editFormData && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-lg">
                <h2 className="text-xl font-semibold mb-4">Edit Proyek</h2>
                <form onSubmit={handleUpdateSubmit}>
                  <div className="mb-4">
                    <label htmlFor="edit_project_name" className="block text-sm font-medium">Nama Proyek</label>
                    <input type="text" id="edit_project_name" name="project_name" value={editFormData.project_name} onChange={(e) => handleFormChange(e, 'edit')} className="w-full p-2 border border-gray-300 rounded" required />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="edit_project_desc" className="block text-sm font-medium">Deskripsi Proyek</label>
                    <input type="text" id="edit_project_desc" name="project_desc" value={editFormData.project_desc} onChange={(e) => handleFormChange(e, 'edit')} className="w-full p-2 border border-gray-300 rounded" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="edit_project_color" className="block text-sm font-medium">Warna Aksen</label>
                    <input type="color" id="edit_project_color" name="project_color" value={editFormData.project_color} onChange={(e) => handleFormChange(e, 'edit')} className="w-full h-10 border border-gray-300 rounded" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label htmlFor="edit_project_status" className="block text-sm font-medium">Status Proyek</label>
                      <select id="edit_project_status" name="project_status" value={editFormData.project_status} onChange={(e) => handleFormChange(e, 'edit')} className="w-full p-2 border border-gray-300 rounded">
                        <option value="">None</option>
                        <option value="open">Open</option>
                        <option value="on progress">On Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="edit_project_priority" className="block text-sm font-medium">Prioritas Proyek</label>
                      <select id="edit_project_priority" name="project_priority" value={editFormData.project_priority} onChange={(e) => handleFormChange(e, 'edit')} className="w-full p-2 border border-gray-300 rounded">
                        <option value="">None</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="crucial">Crucial</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="edit_client_id" className="block text-sm font-medium">Client</label>
                    <select id="edit_client_id" name="client_id" value={editFormData.client_id} onChange={(e) => handleFormChange(e, 'edit')} className="w-full p-2 border border-gray-300 rounded" required>
                      {clients.map(client => (<option key={client.client_id} value={client.client_id}>{client.client_name.String}</option>))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label htmlFor="edit_start_date" className="block text-sm font-medium">Start Date</label>
                      <input type="date" id="edit_start_date" name="start_date" value={editFormData.start_date} onChange={(e) => handleFormChange(e, 'edit')} className="w-full p-2 border border-gray-300 rounded" />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="edit_due_date" className="block text-sm font-medium">Due Date</label>
                      <input type="date" id="edit_due_date" name="due_date" value={editFormData.due_date} onChange={(e) => handleFormChange(e, 'edit')} className="w-full p-2 border border-gray-300 rounded" />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <button type="button" onClick={() => setShowEditModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Update</button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
}
