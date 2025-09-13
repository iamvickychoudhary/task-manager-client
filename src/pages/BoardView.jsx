import  { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBoard,
  createList,
  createTask,
  deleteTask,
  deleteList,
  updateTask,
  updateList,
  moveTaskApi,
  applyBoardUpdate,
} from "../store/slices/boardSlice.js";
import socket from "../sockets/socket.js";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default function BoardView() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { current, lists, tasks, status } = useSelector((s) => s.boards);

  const [newListTitle, setNewListTitle] = useState("");
  const [taskInputs, setTaskInputs] = useState({}); 

  // For editing lists
  const [editingList, setEditingList] = useState(null);
  const [editingListTitle, setEditingListTitle] = useState("");

  // For editing tasks
  const [editingTask, setEditingTask] = useState(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState("");

  // Fetch board
  useEffect(() => {
    dispatch(fetchBoard(id));
    socket.connect();
    socket.emit("join-board", id);

    const handler = (payload) => {
      dispatch(applyBoardUpdate(payload));
    };
    socket.on("board:update", handler);

    return () => {
      socket.emit("leave-board", id);
      socket.off("board:update", handler);
      socket.disconnect();
    };
  }, [id, dispatch]);

  // Create list
  const addList = async (e) => {
    e.preventDefault();
    if (!newListTitle) return;
    await dispatch(createList({ boardId: id, title: newListTitle })).unwrap();
    setNewListTitle("");
    dispatch(fetchBoard(id));
  };

  // Create task
  const addTask = async (listId) => {
    const title = taskInputs[listId];
    if (!title) return;
    await dispatch(createTask({ boardId: id, listId, title })).unwrap();
    setTaskInputs((prev) => ({ ...prev, [listId]: "" }));
    dispatch(fetchBoard(id));
  };

  // Drag & drop
  const onDragEnd = useCallback(
    async (result) => {
      const { source, destination, draggableId } = result;
      if (!destination) return;
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      )
        return;

      await dispatch(
        moveTaskApi({
          taskId: draggableId,
          fromListId: source.droppableId,
          toListId: destination.droppableId,
          toIndex: destination.index,
        })
      ).unwrap();

      dispatch(fetchBoard(id));
    },
    [id, dispatch]
  );

  // Get tasks for list
  const listTasks = (listId) => {
    const order = lists.find((l) => l._id === listId)?.taskOrder || [];
    const ordered = order
      .map((tid) => tasks.find((t) => t._id === String(tid)))
      .filter(Boolean);
    const remaining = tasks.filter(
      (t) => t.list === listId && !order.includes(t._id)
    );
    return [...ordered, ...remaining];
  };

  if (status === "loading") {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl mb-4">{current?.title}</h2>
      </div>

      <form onSubmit={addList} className="mb-4 flex gap-2">
        <input
          value={newListTitle}
          onChange={(e) => setNewListTitle(e.target.value)}
          placeholder="New list title"
          className="p-2 border rounded flex-1"
        />
        <button className="p-2 bg-indigo-600 text-white rounded">
          Add List
        </button>
      </form>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-auto pb-8">
          {lists.map((list) => (
            <Droppable droppableId={String(list._id)} key={list._id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-100 p-3 rounded w-80 flex-shrink-0"
                >
                  {/* List header */}
                  <div className="flex justify-between items-center mb-2">
                    {editingList === list._id ? (
                      <div className="flex gap-1 flex-1">
                        <input
                          value={editingListTitle}
                          onChange={(e) => setEditingListTitle(e.target.value)}
                          className="border p-1 rounded text-sm flex-1"
                        />
                        <button
                          onClick={async () => {
                            if (!editingListTitle) return;
                            await dispatch(
                              updateList({
                                id: list._id,
                                updates: { title: editingListTitle },
                              })
                            ).unwrap();
                            setEditingList(null);
                            setEditingListTitle("");
                            dispatch(fetchBoard(id));
                          }}
                          className="text-sm text-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingList(null);
                            setEditingListTitle("");
                          }}
                          className="text-sm text-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold">{list.title}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingList(list._id);
                              setEditingListTitle(list.title);
                            }}
                            className="text-sm text-indigo-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm("Are you sure want to delete list?"))
                                return;
                              await dispatch(deleteList(list._id)).unwrap();
                              dispatch(fetchBoard(id));
                            }}
                            className="text-sm text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Tasks */}
                  <div>
                    {listTasks(list._id).map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >
                        {(prov) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            className="bg-white p-2 rounded mb-2 shadow"
                          >
                            <div className="flex justify-between">
                              <div>
                                {editingTask === task._id ? (
                                  <div className="flex gap-1 items-center">
                                    <input
                                      value={editingTaskTitle}
                                      onChange={(e) =>
                                        setEditingTaskTitle(e.target.value)
                                      }
                                      className="border p-1 rounded text-sm flex-1"
                                    />
                                    <button
                                      onClick={async () => {
                                        if (!editingTaskTitle) return;
                                        await dispatch(
                                          updateTask({
                                            id: task._id,
                                            updates: { title: editingTaskTitle },
                                          })
                                        ).unwrap();
                                        setEditingTask(null);
                                        setEditingTaskTitle("");
                                        dispatch(fetchBoard(id));
                                      }}
                                      className="text-sm text-green-600"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingTask(null);
                                        setEditingTaskTitle("");
                                      }}
                                      className="text-sm text-gray-500"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <div className="font-medium">
                                      {task.title}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {task.description}
                                    </div>
                                  </>
                                )}
                              </div>
                              {editingTask !== task._id && (
                                <div className="flex flex-col items-end gap-2">
                                  <button
                                    onClick={async () => {
                                      if (
                                        !confirm(
                                          "Are you sure want to delete the task?"
                                        )
                                      )
                                        return;
                                      await dispatch(deleteTask(task._id)).unwrap();
                                      dispatch(fetchBoard(id));
                                    }}
                                    className="text-sm text-red-600"
                                  >
                                    Del
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingTask(task._id);
                                      setEditingTaskTitle(task.title);
                                    }}
                                    className="text-sm text-indigo-600"
                                  >
                                    Edit
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>

                  {/* Add task input */}
                  <div className="mt-2">
                    <input
                      value={taskInputs[list._id] || ""}
                      onChange={(e) =>
                        setTaskInputs((prev) => ({
                          ...prev,
                          [list._id]: e.target.value,
                        }))
                      }
                      placeholder="New task"
                      className="w-full p-2 border rounded mb-2"
                    />
                    <button
                      onClick={() => addTask(list._id)}
                      className="w-full p-2 bg-green-600 text-white rounded"
                    >
                      Add Task
                    </button>
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
