import EyeTrackingComponent from './RobotTraking'
import TaskList from './TaskListHome'
import { Menu } from 'lucide-react'
import AddItemModal from './AddItemModal'
import { useState } from 'react'

interface Item {
	id: string
	title: string
	description: string
	assignedTo?: string
	priority: 'low' | 'medium' | 'high'
	completed: boolean
	type: 'task' | 'project'
}

function MainHome() {
	const [isModalOpen, setIsModalOpen] = useState(false)
  const [items, setItems] = useState<Item[]>(() => {
		const savedItems = localStorage.getItem('items')
		return savedItems ? JSON.parse(savedItems) : []
	})
  const [modalType, setModalType] = useState<'task' | 'project'>('task')

  const handleItemToggle = (itemId: string) => {
		setItems((prevItems) =>
			prevItems.map((item) => (item.id === itemId ? { ...item, completed: !item.completed } : item)),
		)
	}

	const handleItemDelete = (itemId: string) => {
		setItems((prevItems) => prevItems.filter((item) => item.id !== itemId))
	}

	const openModal = (type: 'task' | 'project') => {
		setModalType(type)
		setIsModalOpen(true)
	}
  const handleAddItem = (data: {
		title: string
		description: string
		assignedTo?: string
		priority: 'low' | 'medium' | 'high'
	}) => {
		const newItem: Item = {
			id: Date.now().toString(),
			title: data.title,
			description: data.description,
			assignedTo: data.assignedTo,
			priority: data.priority,
			completed: false,
			type: modalType,
		}
		setItems((prevItems) => [...prevItems, newItem])
	}

  return (
    <>
    <main className="grid grid-cols-3 grid-rows-3 gap-5 m-5 flex-1">
					<div className="bg-white/80 dark:bg-gray-900/80 rounded-xl col-span-2 py-4 px-6 transition-colors duration-300 grid grid-cols-3 justify-between">
						<div className="flex flex-col justify-around col-span-2">
							<div>
								<h1 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Bienvenido a Solware!</h1>
								<p className="text-gray-700 dark:text-gray-300">Recuerda revisar los proyectos pendientes y el calendario</p>
							</div>
							<div className="flex gap-4">
								<button
									onClick={() => openModal('project')}
									className="text-white bg-blue-600 hover:bg-blue-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 transition"
								>
									Nuevo Proyecto
								</button>
								<button
									onClick={() => openModal('task')}
									className="text-white bg-blue-600 hover:bg-blue-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 transition"
								>
									Nueva Tarea
								</button>
							</div>
						</div>
						<EyeTrackingComponent
							className={
								'size-36 drop-shadow-[0px_0px_10px_rgba(0,0,0,0.5)] dark:drop-shadow-[0px_0px_10px_rgba(225,225,225,0.5)] transition duration-300'
							}
						/>
					</div>
					<div className="grid col-span-1 row-span-3 gap-5">
						<div className="bg-white/80 dark:bg-gray-900/80 rounded-xl py-4 px-6 transition-colors duration-300"></div>
						<div className="grid grid-rows-3 gap-5">
							<div className="bg-white/80 dark:bg-gray-900/80 rounded-xl py-4 px-6 transition-colors duration-300 relative row-span-2"></div>
							<div className="bg-white/80 dark:bg-gray-900/80 rounded-xl py-4 px-6 transition-colors duration-300"></div>
						</div>
					</div>
					<div className="grid grid-cols-2 col-span-2 gap-5">
						<div className="bg-white/80 dark:bg-gray-900/80 rounded-xl py-4 px-8 flex flex-col justify-center items-center gap-5 transition-colors duration-300">
							<header className="flex justify-between w-full">
								<p className="text-lg font-bold text-gray-700 dark:text-gray-300 transition-colors duration-300">
									<span className="bg-gray-500/20 dark:bg-white/20 p-1 px-2 rounded-lg mr-2 transition-colors duration-300">
										6
									</span>
									/26
								</p>
								<button>
									<Menu className="text-gray-700 dark:text-gray-300 transition-colors duration-300" />
								</button>
							</header>
							<div className="flex justify-between w-full items-center">
								<p className="text-2xl font-medium max-w-36 text-gray-700 dark:text-gray-300 transition-colors duration-300">
									Proyectos en progreso
								</p>
								<div className="relative size-24">
									<svg className="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
										<circle
											cx="18"
											cy="18"
											r="16"
											fill="none"
											className="stroke-current text-gray-400/70 dark:text-gray-200 transition-colors duration-300"
											stroke-width="4"
										></circle>
										<circle
											cx="18"
											cy="18"
											r="16"
											fill="none"
											className="stroke-current text-purple-600"
											stroke-width="4"
											stroke-dasharray="100"
											stroke-dashoffset="87"
											stroke-linecap="round"
										></circle>
									</svg>
									<div className="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2">
										<span className="text-center text-2xl font-bold text-gray-700 dark:text-gray-300 transition-colors duration-300">
											23%
										</span>
									</div>
								</div>
							</div>
						</div>
						<div className="bg-white/80 dark:bg-gray-900/80 rounded-xl py-4 px-8 flex flex-col justify-center items-center gap-5 transition-colors duration-300">
							<header className="flex justify-between w-full">
								<p className="text-lg font-bold text-gray-700 dark:text-gray-300 transition-colors duration-300">
									<span className="bg-gray-500/20 dark:bg-white/20 p-1 px-2 rounded-lg mr-2 transition-colors duration-300">
										15
									</span>
									/26
								</p>
								<button>
									<Menu className="text-gray-700 dark:text-gray-300 transition-colors duration-300" />
								</button>
							</header>
							<div className="flex justify-between w-full items-center">
								<p className="text-2xl font-medium max-w-36 text-gray-700 dark:text-gray-300 transition-colors duration-300">
									Proyectos completados
								</p>
								<div className="relative size-24">
									<svg className="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
										<circle
											cx="18"
											cy="18"
											r="16"
											fill="none"
											className="stroke-current text-gray-400/70 dark:text-gray-200 transition-colors duration-300"
											stroke-width="4"
										></circle>
										<circle
											cx="18"
											cy="18"
											r="16"
											fill="none"
											className="stroke-current text-blue-500"
											stroke-width="4"
											stroke-dasharray="100"
											stroke-dashoffset="48"
											stroke-linecap="round"
										></circle>
									</svg>
									<div className="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2">
										<span className="text-center text-2xl font-bold text-gray-700 dark:text-gray-300 transition-colors duration-300">
											58%
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="col-span-2 bg-white/80 dark:bg-gray-900/80 rounded-xl py-4 px-6 transition-colors duration-300 relative">
						<h2 className="mb-2 font-medium text-2xl text-gray-700 dark:text-gray-300">Tareas y Proyectos</h2>
						<h2 className="mb-2 font-medium text-2xl text-gray-700 dark:text-gray-300">Tareas y Proyectos</h2>
						<h2 className="mb-2 font-medium text-2xl text-gray-700 dark:text-gray-300">Tareas y Proyectos</h2>
						<h2 className="mb-2 font-medium text-2xl text-gray-700 dark:text-gray-300">Tareas y Proyectos</h2>
						<h2 className="mb-2 font-medium text-2xl text-gray-700 dark:text-gray-300">Tareas y Proyectos</h2>
						<h2 className="mb-2 font-medium text-2xl text-gray-700 dark:text-gray-300">Tareas y Proyectos</h2>
						<h2 className="mb-2 font-medium text-2xl text-gray-700 dark:text-gray-300">Tareas y Proyectos</h2>
						
						<div className="absolute inset-x-6 bottom-4 top-16 overflow-y-auto">
							<TaskList tasks={items} onTaskToggle={handleItemToggle} onTaskDelete={handleItemDelete} />
						</div>
					</div>
				</main>
        <AddItemModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				type={modalType}
				onSubmit={handleAddItem}
			/>
      </>
  )
}

export default MainHome