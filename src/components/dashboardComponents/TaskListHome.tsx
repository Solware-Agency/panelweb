import React from 'react'
import { Trash2 } from 'lucide-react'

interface Item {
	id: string
	title: string
	description: string
	assignedTo?: string
	priority: 'low' | 'medium' | 'high'
	completed: boolean
	type: 'task' | 'project'
}

interface TaskListProps {
	tasks: Item[]
	onTaskToggle: (taskId: string) => void
	onTaskDelete: (taskId: string) => void
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskToggle, onTaskDelete }) => {
	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'high':
				return 'shadow-red-500'
			case 'medium':
				return 'shadow-orange-500'
			case 'low':
				return 'shadow-blue-500'
			default:
				return 'shadow-blue-500'
		}
	}

	// Ordenar tareas: no completadas primero, completadas al final
	const sortedTasks = [...tasks].sort((a, b) => {
		if (a.completed === b.completed) return 0
		return a.completed ? 1 : -1
	})

	return (
		<div className="space-y-2">
			{sortedTasks.map((item) => (
				<div
					key={item.id}
					className={`bg-white dark:bg-gray-900/80 p-2 rounded-xl text-sm flex items-center justify-between shadow-[-5px_0px_0px_0px_rgba(0,0,0,0.75)] ${getPriorityColor(
						item.priority,
					)} mx-2 hover:bg-gray-200 hover:dark:bg-gray-950/40 transition-colors ${
						item.completed ? 'opacity-60 dark:opacity-40' : ''
					}`}
				>
					<div className="flex items-center gap-2 py-1">
						<input
							type="checkbox"
							name={item.id}
							id={item.id}
							checked={item.completed}
							onChange={() => onTaskToggle(item.id)}
							className="appearance-none size-5 mx-3 border border-gray-300 rounded checked:bg-blue-600 checked:border-blue-600 focus:outline-none dark:border-gray-600 dark:checked:bg-blue-600 dark:checked:border-blue-600 dark:focus:ring-blue-600 relative after:content-[''] after:absolute after:left-[7px] after:top-[4px] after:w-[5px] after:h-[8px] after:border-r-2 after:border-b-2 after:border-white after:rotate-45 after:opacity-0 checked:after:opacity-100"
						/>
						<label
							htmlFor={item.id}
							className={`text-xl font-medium text-gray-700 dark:text-gray-300 ${
								item.completed ? 'line-through decoration-2' : ''
							}`}
						>
							{item.title}{' '}
							<sup className="text-xs text-gray-500 dark:text-gray-400 mr-2">
								{item.type === 'task' ? 'Tarea' : 'Proyecto'}
							</sup>
							<p className={`text-sm font-light ${item.completed ? 'line-through decoration-1' : ''}`}>
								{item.description}
							</p>
						</label>
					</div>
					<button
						onClick={() => onTaskDelete(item.id)}
						className="p-1 rounded-lg transition-colors"
						title={`Eliminar ${item.type === 'task' ? 'tarea' : 'proyecto'}`}
					>
						<Trash2
							className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 mr-2"
							size={20}
						/>
					</button>
				</div>
			))}
		</div>
	)
}

export default TaskList