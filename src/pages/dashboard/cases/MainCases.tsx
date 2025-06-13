import { BackgroundGradient } from '../../../components/ui/background-gradient'

function MainCases() {
	return (
		<div className="p-3 sm:p-6">
			<div className="mb-4 sm:mb-6">
				<h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Reportes y Análisis</h1>
				<p className="text-white">Informes detallados sobre el rendimiento de tu negocio</p>
			</div>

			{/* Quick Actions */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
				<BackgroundGradient containerClassName="col-span-1 grid" className="grid">
					<div className="bg-gray-900 rounded-xl text-white p-4">
						<h2 className="text-lg font-bold mb-2">Caso 1</h2>
						<p className="text-sm text-gray-400">Descripción del caso 1</p>
					</div>
				</BackgroundGradient>
			</div>
		</div>
	)
}

export default MainCases
