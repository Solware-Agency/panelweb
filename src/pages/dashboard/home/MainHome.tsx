import EyeTrackingComponent from '../../../components/dashboardComponents/RobotTraking'

function MainHome() {
	return (
		<>
			<main className="m-5 parent">
				{/* Grid 1 */}
				<div className="bg-white/80 dark:bg-gray-900/80 rounded-xl py-4 px-6 transition-colors duration-300 flex items-center justify-around div1">
					<div>
						<h1 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Bienvenido a Solware!</h1>
						<p className="text-gray-700 dark:text-gray-300">
							Recuerda revisar los proyectos pendientes y el calendario
						</p>
					</div>
					<EyeTrackingComponent
						className={
							'size-36 drop-shadow-[0px_0px_10px_rgba(0,0,0,0.5)] dark:drop-shadow-[0px_0px_10px_rgba(225,225,225,0.5)] transition duration-300'
						}
					/>
				</div>
				{/* Grid 2 */}
				<div className="bg-white/80 dark:bg-gray-900/80 rounded-xl py-5 px-6 transition-colors duration-300 div2">
					<h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Ingresos por Servicio</h2>
					<div className="flex gap-5 items-center justify-center p-5">
						<div className="relative size-40">
							<svg className="size-full -rotate-90" viewBox="0 0 36 36">
								<circle
									cx="18"
									cy="18"
									r="14"
									fill="none"
									className="stroke-current text-gray-200 dark:text-neutral-700"
									stroke-width="5"
								></circle>
								<circle
									cx="18"
									cy="18"
									r="14"
									fill="none"
									className="stroke-current text-red-500 dark:text-red-500"
									stroke-width="5"
									stroke-dasharray="100"
									stroke-dashoffset="0"
								></circle>

								<circle
									cx="18"
									cy="18"
									r="14"
									fill="none"
									className="stroke-current text-orange-500 dark:text-orange-500"
									stroke-width="5"
									stroke-dasharray="100"
									stroke-dashoffset="50"
								></circle>
								<circle
									cx="18"
									cy="18"
									r="14"
									fill="none"
									className="stroke-current text-blue-600 dark:text-blue-500"
									stroke-width="5"
									stroke-dasharray="100"
									stroke-dashoffset="65"
								></circle>
							</svg>
						</div>
						<ul className="flex flex-col gap-2">
							<li className="flex items-center gap-2">
								<div className="size-2 bg-blue-500 dark:bg-blue-500 rounded-full"></div>
								<p className="text-gray-700 dark:text-gray-300">Automatización de Procesos: 100$</p>
							</li>
							<li className="flex items-center gap-2">
								<div className="size-2 bg-orange-500 dark:bg-orange-500 rounded-full"></div>
								<p className="text-gray-700 dark:text-gray-300">Agentes IA: 25$</p>
							</li>
							<li className="flex items-center gap-2">
								<div className="size-2 bg-red-500 dark:bg-red-500 rounded-full"></div>
								<p className="text-gray-700 dark:text-gray-300">Desarrollo Web y Móvil: 1000$</p>
							</li>
						</ul>
					</div>
				</div>
				{/* Grid 3 */}
				<div className='bg-white/80 dark:bg-gray-900/80 rounded-xl py-5 px-6 transition-colors duration-300 div3'></div>
				{/* Grid 4 */}
				<div className='bg-white/80 dark:bg-gray-900/80 rounded-xl py-5 px-6 transition-colors duration-300 div4'></div>
				{/* Grid 5 */}
				<div className='bg-white/80 dark:bg-gray-900/80 rounded-xl py-5 px-6 transition-colors duration-300 div5'></div>
				{/* Grid 6 */}
				<div className='bg-white/80 dark:bg-gray-900/80 rounded-xl py-5 px-6 transition-colors duration-300 div6'></div>
				{/* Grid 7 */}
				<div className='bg-white/80 dark:bg-gray-900/80 rounded-xl py-5 px-6 transition-colors duration-300 div7'></div>
				{/* Grid 8 */}
				<div className='bg-white/80 dark:bg-gray-900/80 rounded-xl py-5 px-6 transition-colors duration-300 div8'></div>
			</main>
		</>
	)
}

export default MainHome
