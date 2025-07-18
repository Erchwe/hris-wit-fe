import { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { AxiosResponse } from 'axios'; // <-- Penting: Impor tipe AxiosResponse
import api from '../../utils/api';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

// --- INTERFACE (tetap sama) ---
interface NullableTime {
  Time: string;
  Valid: boolean;
}

interface Project {
  project_id: string;
  project_name: { String: string; Valid: boolean };
  project_status: any;
  deleted_at: NullableTime;
}

interface List {
  list_id: string;
  project_id: string;
  deleted_at: NullableTime;
}

interface Task {
  task_id: string;
  task_name: { String: string; Valid: boolean };
  list_id: string;
  task_status: any;
  task_priority: any;
  due_date: NullableTime;
  deleted_at: NullableTime;
}

const decodeEnum = (data: any): string => {
  let valueToDecode = '';
  if (typeof data === 'string') valueToDecode = data;
  else if (data?.Valid && typeof data.String === 'string') valueToDecode = data.String;

  if (valueToDecode) {
    try { return atob(valueToDecode); } catch (e) { return valueToDecode; }
  }
  return '';
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projectsResponse, tasksResponse] = await Promise.all([
          api.get('/project'),
          api.get('/task')
        ]);

        const fetchedProjects: Project[] = projectsResponse.data.data || [];
        setProjects(fetchedProjects);
        setTasks(tasksResponse.data.data || []);

        if (fetchedProjects.length > 0) {
          const listPromises = fetchedProjects.map(project =>
              api.get(`/project/${project.project_id}/lists`)
          );

          const listResults = await Promise.allSettled(listPromises);

          // ================== BAGIAN YANG DIPERBAIKI ==================
          // Type guard ini sekarang benar karena cocok dengan tipe AxiosResponse
          const allLists: List[] = listResults
              .filter(
                  (result): result is PromiseFulfilledResult<AxiosResponse<{ data: List[] }>> =>
                      result.status === 'fulfilled' && !!result.value.data?.data
              )
              // Data dari axios ada di dalam .value.data.data
              .flatMap(result => result.value.data.data);
          // ==========================================================

          setLists(allLists);
        }

      } catch (error) {
        console.error("Gagal mengambil data utama:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Sisa logika komponen (tetap sama) ---
  const activeProjects = projects.filter(p => !p.deleted_at?.Valid);
  const activeLists = lists.filter(l => !l.deleted_at?.Valid);
  const activeTasks = tasks.filter(t => !t.deleted_at?.Valid);

  const validTasks = activeTasks.filter(task => {
    const list = activeLists.find(l => l.list_id === task.list_id);
    return list && activeProjects.some(p => p.project_id === list.project_id);
  });

  const activeProjectsCount = activeProjects.filter(p => ['open', 'on progress'].includes(decodeEnum(p.project_status))).length;
  const totalValidTasksCount = validTasks.length;
  const openTasksCount = validTasks.filter(t => ['open', 'on progress'].includes(decodeEnum(t.task_status))).length;

  const projectStatusData = {
    labels: ['Open', 'On Progress', 'Done'],
    datasets: [{
      label: 'Project Status',
      data: [
        activeProjects.filter(p => decodeEnum(p.project_status) === 'open').length,
        activeProjects.filter(p => decodeEnum(p.project_status) === 'on progress').length,
        activeProjects.filter(p => decodeEnum(p.project_status) === 'done').length,
      ],
      backgroundColor: ['#3b82f6', '#f59e0b', '#10b981'],
    }],
  };

  const taskPriorityData = {
    labels: ['Low', 'Medium', 'High', 'Crucial'],
    datasets: [{
      label: 'Jumlah Tugas berdasarkan Prioritas',
      data: [
        validTasks.filter(t => decodeEnum(t.task_priority) === 'low').length,
        validTasks.filter(t => decodeEnum(t.task_priority) === 'medium').length,
        validTasks.filter(t => decodeEnum(t.task_priority) === 'high').length,
        validTasks.filter(t => decodeEnum(t.task_priority) === 'crucial').length,
      ],
      backgroundColor: ['#22c55e', '#facc15', '#f97316', '#ef4444'],
    }],
  };

  const upcomingTasks = validTasks
      .filter(task => {
        if (!task.due_date?.Valid) return false;
        const dueDate = new Date(task.due_date.Time);
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const sevenDaysLater = new Date(); sevenDaysLater.setDate(sevenDaysLater.getDate() + 7); sevenDaysLater.setHours(23, 59, 59, 999);
        return dueDate >= today && dueDate <= sevenDaysLater;
      })
      .sort((a, b) => new Date(a.due_date.Time).getTime() - new Date(b.due_date.Time).getTime())
      .slice(0, 5);

  if (loading) {
    return <div className="p-8 text-center">Loading Dashboard...</div>;
  }

  return (
      <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

        {/* Kartu Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 font-semibold">Total Proyek Aktif</h3>
            <p className="text-4xl font-bold text-blue-600 mt-2">{activeProjects.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 font-semibold">Proyek Sedang Berjalan</h3>
            <p className="text-4xl font-bold text-yellow-500 mt-2">{activeProjectsCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 font-semibold">Total Tugas Aktif</h3>
            <p className="text-4xl font-bold text-indigo-600 mt-2">{totalValidTasksCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-500 font-semibold">Tugas Belum Selesai</h3>
            <p className="text-4xl font-bold text-red-500 mt-2">{openTasksCount}</p>
          </div>
        </div>

        {/* Grafik */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-700 mb-4">Status Proyek</h3>
            <div className="h-64 flex items-center justify-center">
              <Pie data={projectStatusData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
          <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-700 mb-4">Prioritas Tugas</h3>
            <div className="h-64">
              <Bar data={taskPriorityData} options={{ maintainAspectRatio: false }}/>
            </div>
          </div>
        </div>

        {/* Daftar Tugas Penting */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-gray-700 mb-4">Tugas Mendekati Tenggat (7 Hari)</h3>
          {upcomingTasks.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {upcomingTasks.map(task => {
                  const list = lists.find(l => l.list_id === task.list_id);
                  const project = list ? projects.find(p => p.project_id === list.project_id) : undefined;

                  return (
                      <li key={task.task_id} className="py-3 flex justify-between items-center">
                        <div>
                          <span className="font-medium text-gray-800">{task.task_name.String}</span>
                          <p className="text-sm text-gray-500">
                            {project && project.project_name ?
                                `Proyek: ${project.project_name.String}` :
                                'Proyek tidak ditemukan'}
                          </p>
                          <span className="text-sm text-red-600 font-semibold whitespace-nowrap">
                      Due: {new Date(task.due_date.Time).toLocaleDateString('id-ID')}
                    </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          {project && (
                              <button
                                  onClick={() => navigate(`/manajemen_proyek/project/${project.project_id}`)}
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                              >
                                Lihat Proyek
                              </button>
                          )}
                        </div>
                      </li>
                  );
                })}
              </ul>
          ) : (
              <p className="text-gray-500">Tidak ada tugas yang akan jatuh tempo dalam waktu dekat.</p>
          )}
        </div>
      </div>
  );
}
