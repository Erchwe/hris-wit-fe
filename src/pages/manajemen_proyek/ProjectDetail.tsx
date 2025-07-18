import React, { useState, useEffect } from 'react';
import api from '../../utils/api.ts';
import { useParams } from 'react-router-dom';
import { StrictModeDroppable as Droppable } from './StrictModeDroppable';
import { DragDropContext, Draggable, DropResult } from 'react-beautiful-dnd';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- INTERFACE ---
interface Task {
  id: number;
  task_id: string;
  list_id: string;
  task_order: { Float64: number; Valid: boolean };
  task_name: { String: string; Valid: boolean };
  task_type: any;
  task_priority: any;
  task_size: any;
  task_status: any;
  task_color: { String: string; Valid: boolean };
  start_date: { Time: string; Valid: boolean };
  due_date: { Time: string; Valid: boolean };
  created_by: string;
  updated_by: { String: string; Valid: boolean };
}

interface List {
  list_id: string;
  list_name: { String: string; Valid: boolean };
  list_order: { Float64: number; Valid: boolean };
}

interface EditFormData {
  task_name: string;
  task_type: string;
  task_priority: string;
  task_size: string;
  task_status: string;
  task_color: string;
  start_date: string;
  due_date: string;
}

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<any>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newList, setNewList] = useState<string>('');
  const [newTaskName, setNewTaskName] = useState('');
  const [addingToListId, setAddingToListId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData | null>(null);
  const [isAddingList, setIsAddingList] = useState(false);

  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListName, setEditingListName] = useState<string>('');

  const fetchLists = async () => {
      if (!projectId) return;
      try {
          const response = await api.get(`/project/${projectId}/lists`);
          const fetchedLists = response.data.data.map((list: any) => ({
              ...list,
              list_order: list.list_order || { Float64: 0, Valid: false }
          }));

          fetchedLists.sort((a: List, b: List) => (a.list_order.Float64 || 0) - (b.list_order.Float64 || 0));

          setLists(fetchedLists);
          console.log("Lists fetched and sorted:", fetchedLists); 
      } catch (error) {
          console.error('Error fetching project lists:', error);
      }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get(`/task`);
      setTasks(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    }
  };

  useEffect(() => {
    const fetchProjectDetails = async () => {
        if (!projectId) return;
      try {
        const response = await api.get(`/project/${projectId}`);
        setProject(response.data.data);
      } catch (error) {
        console.error('Error fetching project details:', error);
      }
    };

    fetchProjectDetails();
    fetchLists();
    fetchTasks();
  }, [projectId]);

  useEffect(() => {
    if (editingTask) {
      const decodeString = (data: any) => {
        if (typeof data === 'string' && data) {
          try { return atob(data); } catch (e) { return data; }
        }
        if (data && data.Valid && typeof data.String === 'string' && data.String) {
          try { return atob(data.String); } catch (e) { return data.String; }
        }
        return '';
      };
      setEditFormData({
        task_name: editingTask.task_name?.String || '',
        task_type: decodeString(editingTask.task_type),
        task_priority: decodeString(editingTask.task_priority),
        task_size: decodeString(editingTask.task_size),
        task_status: decodeString(editingTask.task_status) || 'open',
        task_color: editingTask.task_color?.String || '#4DB2FF',
        start_date: editingTask.start_date?.Valid ? editingTask.start_date.Time.split('T')[0] : '',
        due_date: editingTask.due_date?.Valid ? editingTask.due_date.Time.split('T')[0] : '',
      });
    } else {
      setEditFormData(null);
    }
  }, [editingTask]);

  const handleAddList = async () => {
    if (newList.trim() === '') return;
    try {
      const newListData = {
        project_id: projectId,
        list_name: newList,
        created_by: 'admin',
        list_order: Date.now(), 
      };
      await api.post(`/project/${projectId}/lists`, newListData);
      await fetchLists();
      setNewList('');
      toast.success('List baru berhasil ditambahkan.');
    } catch (error) {
      console.error('Error adding new list:', error);
      toast.error('Gagal menambahkan list.');
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!window.confirm("Yakin ingin menghapus list ini? Semua tugas di dalamnya akan ikut terhapus.")) return;
    try {
      await api.delete(`/project/${projectId}/lists/${listId}`);
      await fetchLists();
      await fetchTasks();
      toast.success('List berhasil dihapus.');
    } catch (error) {
      console.error('Error deleting list:', error);
      toast.error('Gagal menghapus list.');
    }
  };

  const handleEditList = (list: List) => {
    setEditingListId(list.list_id);
    setEditingListName(list.list_name?.String || '');
  };

  const handleCancelEditList = () => {
    setEditingListId(null);
    setEditingListName('');
  };

  const handleSaveListName = async (listId: string) => {
    if (editingListName.trim() === '') return;
    try {
      await api.put(`/project/${projectId}/lists/${listId}`, {
        list_name: editingListName,
        updated_by: 'admin_edit_list'
      });
      toast.success('Nama list berhasil diperbarui!');
      handleCancelEditList();
      await fetchLists();
    } catch (error) {
      console.error('Gagal memperbarui nama list:', error);
      toast.error('Gagal memperbarui nama list.');
    }
  };

  const handleAddTask = async (listId: string) => {
    if (newTaskName.trim() === '') return;
    try {
        const newTaskPayload = { list_id: listId, task_name: newTaskName, created_by: 'admin', task_status: 'open' };
        await api.post(`/task`, newTaskPayload);
        await fetchTasks();
        setNewTaskName('');
        setAddingToListId(null);
    } catch (error) {
      console.error('Error adding new task:', error);
      toast.error('Gagal menambahkan tugas.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Yakin ingin menghapus tugas ini?')) return;
    try {
      await api.delete(`/task/${taskId}`);
      setTasks(tasks.filter((task) => task.task_id !== taskId));
      setEditingTask(null);
      toast.success('Tugas berhasil dihapus.');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Gagal menghapus tugas.');
    }
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editFormData) {
      setEditFormData({ ...editFormData, [name]: value });
    }
  };

  const handleUpdateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTask || !editFormData) return;
    const payload = { ...editFormData, task_id: editingTask.task_id, list_id: editingTask.list_id, updated_by: 'admin_edit' };
    try {
      await api.put(`/task/${editingTask.task_id}`, payload);
      await fetchTasks();
      setEditingTask(null);
      toast.success('Tugas berhasil diperbarui.');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Gagal memperbarui tugas.');
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId, type } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === 'list') {
      const reorderedLists = Array.from(lists);
      const [removed] = reorderedLists.splice(source.index, 1);
      reorderedLists.splice(destination.index, 0, removed);

      const prevList = reorderedLists[destination.index - 1];
      const nextList = reorderedLists[destination.index + 1];

      let newOrder: number;
      if (prevList && nextList) {
          newOrder = ((prevList.list_order?.Float64 || 0) + (nextList.list_order?.Float64 || 0)) / 2;
      } else if (prevList) {
          newOrder = (prevList.list_order?.Float64 || 0) + 100000;
      } else if (nextList) {
          newOrder = (nextList.list_order?.Float64 || 0) / 2;
      } else {
          newOrder = Date.now();
      }

      const updatedMovedList = { ...removed, list_order: { Float64: newOrder, Valid: true } };
      const finalLists = reorderedLists.map(list => list.list_id === draggableId ? updatedMovedList : list);
      setLists(finalLists);

    const payload = {
        list_id: draggableId,
        list_name: removed.list_name.String,
        list_order: newOrder,
        updated_by: 'admin_dnd_list',
    };

    console.log('Payload sent to backend for list order update:', payload);

    api.put(`/project/${projectId}/lists/${draggableId}`, payload)
        .then(() => {
            toast.success('Urutan list berhasil diperbarui!');
        })
        .catch(error => {
            console.error('Gagal memperbarui urutan list:', error);
            toast.error('Gagal memperbarui urutan list. Mengembalikan urutan...');
            fetchLists();
        });
    return;
    }

    const taskToMove = tasks.find(t => t.task_id === draggableId);
    if (!taskToMove) return;

    const buildUpdatePayload = (task: Task, overrides: any) => {
      const decodeString = (data: any) => data && typeof data === 'string' ? atob(data) : '';
      return {
        task_id: task.task_id,
        list_id: task.list_id, 
        task_name: task.task_name.String,
        task_type: decodeString(task.task_type),
        task_priority: decodeString(task.task_priority),
        task_size: decodeString(task.task_size),
        task_status: decodeString(task.task_status),
        task_color: task.task_color.String,
        start_date: task.start_date.Valid ? task.start_date.Time.split('T')[0] : "",
        due_date: task.due_date.Valid ? task.due_date.Time.split('T')[0] : "",
        updated_by: 'admin_dnd', ...overrides,
      };
    };

    if (source.droppableId === destination.droppableId) {
      const listTasks = tasks.filter(t => t.list_id === source.droppableId).sort((a, b) => (a.task_order.Float64 || 0) - (b.task_order.Float64 || 0));
      const [movedItem] = listTasks.splice(source.index, 1);
      listTasks.splice(destination.index, 0, movedItem);
      const prevTask = listTasks[destination.index - 1];
      const nextTask = listTasks[destination.index + 1];
      const prevOrder = prevTask ? prevTask.task_order.Float64 : 0;
      const nextOrder = nextTask ? nextTask.task_order.Float64 : Date.now();
      const newOrder = (prevOrder + nextOrder) / 2;
      const updatedTask = { ...taskToMove, task_order: { Float64: newOrder, Valid: true } };
      const finalTasks = tasks.map(t => t.task_id === draggableId ? updatedTask : t);
      setTasks(finalTasks);
      const payload = buildUpdatePayload(taskToMove, { list_id: source.droppableId, task_order: newOrder }); 
      api.put(`/task/${draggableId}`, payload).catch(_err => { fetchTasks(); });
      return;
    }

    const destListTasks = tasks.filter(t => t.list_id === destination.droppableId).sort((a, b) => (a.task_order.Float64 || 0) - (b.task_order.Float64 || 0));
    const tempDestTasks = [...destListTasks];
    const taskMoving = { ...taskToMove, list_id: destination.droppableId }; 
    tempDestTasks.splice(destination.index, 0, taskMoving);
    
    const prevTask = tempDestTasks[destination.index - 1];
    const nextTask = tempDestTasks[destination.index + 1];
    const prevOrder = prevTask ? prevTask.task_order.Float64 : 0;
    const nextOrder = nextTask ? nextTask.task_order.Float64 : Date.now();
    const newOrder = (prevOrder + nextOrder) / 2;
    const finalTasks = tasks.map(t => t.task_id === draggableId ? { ...t, list_id: destination.droppableId, task_order: { Float64: newOrder, Valid: true } } : t);
    setTasks(finalTasks);
    const payload = buildUpdatePayload(taskToMove, { list_id: destination.droppableId, task_order: newOrder });
    api.put(`/task/${draggableId}`, payload).catch(_error => { fetchTasks(); });
  };

  if (!project) return <div className="p-8 text-center">Loading...</div>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="p-4 md:p-6 lg:p-8">
        <h1 className="text-3xl font-bold mb-2">{project.project_name?.String}</h1>
        <p className="text-gray-600 mb-6">{project.project_desc?.String}</p>
        <p className="text-gray-600 mb-6"></p>

        <Droppable droppableId="all-lists" direction="horizontal" type="list">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="flex items-start overflow-x-auto space-x-4 pb-4">
              {lists.map((list, index) => (
                <Draggable key={list.list_id} draggableId={list.list_id} index={index}>
                  {(provided) => (
                    <div {...provided.draggableProps} ref={provided.innerRef} className="bg-gray-100 rounded-lg min-w-[300px] flex flex-col">
                      <div {...provided.dragHandleProps} className="p-3 border-b bg-gray-200 rounded-t-lg cursor-grab">
                        <div className="flex justify-between items-center">
                          {editingListId === list.list_id ? (
                            <div className="flex-grow flex items-center gap-2">
                              <input
                                type="text"
                                value={editingListName}
                                onChange={(e) => setEditingListName(e.target.value)}
                                className="w-full p-1 border border-blue-400 rounded"
                                autoFocus
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveListName(list.list_id) }}
                              />
                              <button onClick={() => handleSaveListName(list.list_id)} className="text-green-600 hover:text-green-700"><i className="fas fa-check"></i></button>
                              <button onClick={handleCancelEditList} className="text-red-600 hover:text-red-700"><i className="fas fa-times"></i></button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-800">{list.list_name?.String}</h3>
                                <button onClick={() => handleEditList(list)} className="text-gray-400 hover:text-blue-600" title="Edit nama list">
                                  <i className="fas fa-pencil-alt fa-xs"></i>
                                </button>
                              </div>
                              <button
                                onClick={() => handleDeleteList(list.list_id)}
                                className="text-sm font-semibold text-gray-500 hover:text-red-600 px-2 py-1"
                                title="Hapus list ini"
                              >
                                Hapus
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <Droppable droppableId={list.list_id} type="task">
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.droppableProps} className="p-3 space-y-3">
                            {tasks
                              .filter((task) => task.list_id === list.list_id)
                              .sort((a, b) => (a.task_order.Float64 || 0) - (b.task_order.Float64 || 0))
                              .map((task, index) => (
                                <Draggable key={task.task_id} draggableId={task.task_id} index={index}>
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                      onClick={() => setEditingTask(task)}
                                      className="group relative bg-white p-3 rounded-md shadow-sm cursor-pointer hover:bg-gray-50 transition-all duration-200 ease-in-out" 
                                      style={{ cursor: 'grab', ...provided.draggableProps.style }}
                                    >
                                      {/* Tooltip untuk hover */}
                                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        Klik untuk edit detail
                                      </div>

                                      <div className="flex items-center mb-2">
                                        {task.task_color.Valid && task.task_color.String &&
                                          <div className="w-8 h-2 rounded-full mr-3 flex-shrink-0" style={{ backgroundColor: task.task_color.String }}></div>
                                        }
                                        <p className="font-medium text-gray-800">{task.task_name.String}</p>
                                      </div>
                                      <div className="flex items-center flex-wrap gap-2">
                                        {(() => {
                                          const decodeString = (data: any) => {
                                              if (typeof data === 'string' && data) {
                                                  try { return atob(data); } catch(e) { return data; }
                                              }
                                              return '';
                                          };
                                          const renderBadge = (data: any, colorClasses: string) => {
                                            const value = decodeString(data);
                                            if (value) {
                                              return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colorClasses}`}>{value}</span>;
                                            }
                                            return null;
                                          };
                                          return (
                                            <>
                                              {renderBadge(task.task_priority, 'bg-red-100 text-red-800')}
                                              {renderBadge(task.task_type, 'bg-blue-100 text-blue-800')}
                                              {renderBadge(task.task_size, 'bg-yellow-100 text-yellow-800')}
                                              {renderBadge(task.task_status, 'bg-green-100 text-green-800')}
                                            </>
                                          );
                                        })()}
                                      </div>
                                      {task.due_date.Valid &&
                                        <p className="text-xs text-gray-500 mt-3 text-right">
                                          Due: {new Date(task.due_date.Time).toLocaleDateString('id-ID')}
                                        </p>
                                      }
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                       <div className="p-3 border-t">
                        {addingToListId === list.list_id ? (
                            <div className="mt-1">
                              <textarea
                                value={newTaskName}
                                onChange={(e) => setNewTaskName(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                placeholder="Masukkan judul untuk tugas ini..."
                                rows={3}
                                autoFocus
                              />
                              <div className="mt-2 flex items-center space-x-2">
                                <button onClick={() => handleAddTask(list.list_id)} className="bg-green-500 text-white px-4 py-1.5 rounded-md hover:bg-green-600">Tambah Kartu</button>
                                <button onClick={() => setAddingToListId(null)} className="text-gray-500 hover:text-gray-800"><i className="fas fa-times"></i></button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => setAddingToListId(list.list_id)} className="text-gray-500 hover:text-blue-600 w-full text-left p-2 rounded-md">
                              + Tambah tugas
                            </button>
                          )}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              <div className="flex-shrink-0 w-[300px]">
                {isAddingList ? (
                  <div className="bg-gray-200 p-3 rounded-lg">
                    <input
                      type="text" value={newList} onChange={(e) => setNewList(e.target.value)}
                      className="w-full p-2 border border-blue-400 rounded" placeholder="Masukkan judul list..."
                      autoFocus onKeyDown={(e) => { if (e.key === 'Enter') handleAddList() }}
                    />
                    <div className="mt-2 flex items-center space-x-2">
                      <button onClick={handleAddList} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md">
                        Tambah List
                      </button>
                      <button onClick={() => setIsAddingList(false)} className="text-gray-500 hover:text-gray-800 text-xl">
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setIsAddingList(true)} className="w-full bg-black bg-opacity-20 hover:bg-opacity-30 text-white font-semibold p-3 rounded-lg text-left transition-colors">
                    + Tambah list
                  </button>
                )}
              </div>
            </div>
          )}
        </Droppable>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
      {editingTask && editFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md my-8">
            <h2 className="text-2xl font-bold mb-4">Edit Task</h2>
              <form onSubmit={handleUpdateTask}>
                <div className="mb-4">
                  <label htmlFor="task_name" className="block text-sm font-medium text-gray-700">Task Name</label>
                  <input type="text" name="task_name" id="task_name" value={editFormData.task_name} onChange={handleEditFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                </div>
                <div className="mb-4">
                  <label htmlFor="task_type" className="block text-sm font-medium text-gray-700">Type</label>
                  <select name="task_type" id="task_type" value={editFormData.task_type} onChange={handleEditFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    <option value="">None</option> <option value="task">Task</option> <option value="bug">Bug</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="task_priority" className="block text-sm font-medium text-gray-700">Priority</label>
                  <select name="task_priority" id="task_priority" value={editFormData.task_priority} onChange={handleEditFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    <option value="">None</option> <option value="low">Low</option> <option value="medium">Medium</option> <option value="high">High</option> <option value="crucial">Crucial</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="task_size" className="block text-sm font-medium text-gray-700">Size</label>
                  <select name="task_size" id="task_size" value={editFormData.task_size} onChange={handleEditFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    <option value="">None</option> <option value="easy">Easy</option> <option value="medium">Medium</option> <option value="hard">Hard</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="task_status" className="block text-sm font-medium text-gray-700">Status</label>
                  <select name="task_status" id="task_status" value={editFormData.task_status} onChange={handleEditFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                    <option value="open">Open</option> <option value="on progress">On Progress</option> <option value="done">Done</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="task_color" className="block text-sm font-medium text-gray-700">Color</label>
                  <input type="color" name="task_color" id="task_color" value={editFormData.task_color} onChange={handleEditFormChange} className="mt-1 block w-full h-10 border border-gray-300 rounded-md" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input type="date" name="start_date" id="start_date" value={editFormData.start_date} onChange={handleEditFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">Due Date</label>
                    <input type="date" name="due_date" id="due_date" value={editFormData.due_date} onChange={handleEditFormChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                  </div>
                </div>
                <div className="flex justify-between items-center mt-6">
                  <button type="button" onClick={() => handleDeleteTask(editingTask.task_id)} className="text-red-600 hover:text-red-800 font-medium px-4 py-2 rounded-md">Delete Task</button>
                  <div className="flex space-x-3">
                    <button type="button" onClick={() => setEditingTask(null)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Save Changes</button>
                  </div>
                </div>
              </form>
          </div>
        </div>
      )}
    </DragDropContext>
  );
};