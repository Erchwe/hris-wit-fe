import { useState, useEffect } from 'react';
import api from '../../utils/api.ts';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast, ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

// --- INTERFACE ---
interface Project {
  project_id: string;
  project_name: { String: string; Valid: boolean };
  deleted_at?: { Valid: boolean; Time: string };
}

interface List {
  list_id: string;
  project_id: string;
}

interface Task {
  task_id: string;
  task_name: { String: string; Valid: boolean };
  list_id: string;
  task_status: { String: string; Valid: boolean };
}

// --- FUNGSI HELPER ---
const decodeEnum = (data: { String: string; Valid: boolean } | string): string => {
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
      return valueToDecode;
    }
  }
  return '';
};


// --- KOMPONEN UTAMA ---
export default function Report() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false); 

  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  const [editorContent, setEditorContent] = useState('');
  const [recipientEmail] = useState('2272041@maranatha.ac.id');
  const [emailSubject, setEmailSubject] = useState(`Laporan Progres - ${new Date().toLocaleDateString('id-ID')}`);
  const [senderName, setSenderName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projectsResponse, tasksResponse] = await Promise.all([
          api.get(`/project`),
          api.get(`/task`),
        ]);

        const fetchedProjects = projectsResponse.data?.data || [];
        setProjects(fetchedProjects);
        setTasks(tasksResponse.data?.data || []);

        if (fetchedProjects.length > 0) {
          const listPromises = fetchedProjects.map((project: Project) =>
            api.get(`/project/${project.project_id}/lists`)
          );

          const listResults = await Promise.allSettled(listPromises);

        const allLists = listResults
          .filter((result): result is PromiseFulfilledResult<any> =>
              result.status === 'fulfilled' && !!result.value.data?.data
          )
          .flatMap(result => result.value.data.data);

          setLists(allLists);
        }
      } catch (error) {
        console.error("Failed to fetch report data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeProjectIds = new Set(
    projects.filter(p => !p.deleted_at?.Valid).map(p => p.project_id)
  );

  const activeTasks = tasks.filter(task => {
    const isTaskActiveStatus = ['open', 'on progress'].includes(decodeEnum(task.task_status));
    if (!isTaskActiveStatus) {
      return false;
    }
    const list = lists.find(l => l.list_id === task.list_id);
    return list ? activeProjectIds.has(list.project_id) : false;
  });

    useEffect(() => {
        let reportContent = '<h3>Laporan Progres Tugas</h3>';

        if (senderName) {
            reportContent += `<p>Dari: <strong>${senderName}</strong></p>`;
        }

        reportContent += '<p>Berikut adalah tugas-tugas yang sedang dikerjakan:</p>';

        const tasksToShowInReport = activeTasks.filter(task => selectedTaskIds.has(task.task_id));

        if (tasksToShowInReport.length === 0) {
            setEditorContent(`${reportContent}<p>Silakan pilih tugas dari daftar di sebelah kiri.</p>`);
            return;
        }

        const listItems = tasksToShowInReport.map(task => {
            const list = lists.find(l => l.list_id === task.list_id);
            const project = list ? projects.find(p => p.project_id === list.project_id) : undefined;
            return `<li><strong>${task.task_name.String}</strong> (Status: ${decodeEnum(task.task_status)})<br><small>Proyek: ${project ? project.project_name.String : 'N/A'}</small></li>`;
        }).join('');

        setEditorContent(`${reportContent}<ul>${listItems}</ul>`);

    }, [selectedTaskIds, activeTasks, lists, projects, senderName]);

  const handleTaskSelect = (taskId: string, isChecked: boolean) => {
    setSelectedTaskIds(prevSet => {
      const newSet = new Set(prevSet);
      if (isChecked) {
        newSet.add(taskId);
      } else {
        newSet.delete(taskId);
      }
      return newSet;
    });
  };

  const handleSendEmail = async () => {
    if (!recipientEmail || !emailSubject || !senderName) {
      toast.warn('Harap isi email penerima, subjek, dan nama pengirim.'); 
      return;
    }

    setIsSending(true); 
    const sendingToastId = toast.loading("Mengirim laporan...", { autoClose: false }); 

    try {
      const emailData = {
        recipient_email: recipientEmail,
        subject: emailSubject,
        sender_name: senderName,
        body_html: editorContent,
      };

      const response = await api.post(`/send-report-email`, emailData);

      if (response.status === 200) {
        toast.update(sendingToastId, { render: "Laporan berhasil dikirim!", type: "success", isLoading: false, autoClose: 3000 }); 
        setEmailSubject(`Laporan Progres - ${new Date().toLocaleDateString('id-ID')}`);
        setSenderName('');
        setSelectedTaskIds(new Set());
      } else {
        toast.update(sendingToastId, { render: "Gagal mengirim laporan. Silakan coba lagi.", type: "error", isLoading: false, autoClose: 3000 }); 
      }
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast.update(sendingToastId, {
        render: `Terjadi kesalahan: ${error.response?.data?.message || error.message}`,
        type: "error",
        isLoading: false,
        autoClose: 3000
      }); 
    } finally {
      setIsSending(false); 
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Data...</div>;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Buat Laporan Progres</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-3 border-b pb-2">Pilih Tugas untuk Dilaporkan</h3>
          <div className="max-h-[60vh] overflow-y-auto">
            {activeTasks.length > 0 ? (
                activeTasks.map(task => {
                const list = lists.find(l => l.list_id === task.list_id);
                const project = list ? projects.find(p => p.project_id === list.project_id) : undefined;

                return (
                    <div key={task.task_id} className="flex items-start my-2 p-2 hover:bg-gray-50 rounded">
                    <input
                        type="checkbox"
                        id={`task-${task.task_id}`}
                        checked={selectedTaskIds.has(task.task_id)}
                        onChange={(e) => handleTaskSelect(task.task_id, e.target.checked)}
                        className="h-4 w-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`task-${task.task_id}`} className="ml-3 text-sm text-gray-700 cursor-pointer">
                        <span className="font-medium">{task.task_name.String}</span>
                        <p className="text-xs text-gray-500">
                        {project ? project.project_name.String : 'Proyek tidak ditemukan'}
                        </p>
                    </label>
                    </div>
                );
                })
            ) : (
                <p className="text-sm text-gray-500">Tidak ada tugas aktif.</p>
            )}
            </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label htmlFor="senderName" className="block text-sm font-medium text-gray-700">Nama Pengirim</label>
            <input
              type="text" id="senderName" value={senderName} onChange={(e) => setSenderName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
              placeholder="Nama Anda"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-700">Email Penerima (Akun email tester SMTP)</label>
            <input
              type="email"
              id="recipientEmail"
              value={recipientEmail}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-gray-100 cursor-not-allowed"
              disabled // perlu akun SMTP berbayar utk bisa ubah penerima email
            />
          </div>
          <div className="mb-4">
            <label htmlFor="emailSubject" className="block text-sm font-medium text-gray-700">Subjek Email</label>
            <input
              type="text" id="emailSubject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Isi Laporan</label>
            <div className="mt-1 bg-white">
              <ReactQuill
                theme="snow"
                value={editorContent}
                onChange={setEditorContent}
                style={{ height: '300px', marginBottom: '40px' }}
              />
            </div>
          </div>
          <button
            onClick={handleSendEmail}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center" 
            disabled={isSending} 
          >
            {isSending ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mengirim...
              </>
            ) : (
              'Kirim Laporan'
            )}
          </button>
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} /> 
    </div>
  );
}