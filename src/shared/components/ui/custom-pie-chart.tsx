import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface PieChartData {
	branch: string
	revenue: number
	percentage: number
}

interface CustomPieChartProps {
	data: PieChartData[]
	total: number
	isLoading?: boolean
}

// Colores de las sedes según branch-badge.tsx
const COLORS = [
	'#EF4444', // STX - Rojo
	'#8B5CF6', // PMG - Púrpura
	'#10B981', // MCY - Verde
	'#F59E0B', // CPC - Naranja
	'#3B82F6', // CNX - Azul
	'#6B7280', // Default - Gris
]

export const CustomPieChart: React.FC<CustomPieChartProps> = ({ data, total, isLoading }) => {
	const formatCurrency = (value: number) => {
		return `USD ${Math.round(value).toLocaleString()}`
	}

	// Función para obtener el color según el nombre de la sede
	const getBranchColor = (branchName: string) => {
		const branchMap: Record<string, string> = {
			STX: COLORS[0], // Rojo
			PMG: COLORS[1], // Púrpura
			MCY: COLORS[2], // Verde
			CPC: COLORS[3], // Naranja
			CNX: COLORS[4], // Azul
		}

		// Buscar por código o nombre completo
		const upperBranch = branchName.toUpperCase()
		return branchMap[upperBranch] || branchMap[upperBranch.substring(0, 3)] || COLORS[5] // Default gris
	}

	const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: PieChartData }> }) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload
			return (
				<div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
					<p className="font-semibold text-gray-900 dark:text-gray-100">{data.branch}</p>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						{Math.round(data.percentage)}% ({formatCurrency(data.revenue)})
					</p>
				</div>
			)
		}
		return null
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		)
	}

	return (
		<div className="w-full">
			{/* Donut Chart */}
			<div className="h-64 mb-4 relative">
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Pie
							data={data}
							cx="50%"
							cy="50%"
							labelLine={false}
							label={false} // Sin porcentajes dentro del donut
							outerRadius={80}
							innerRadius={60} // Esto crea el efecto donut
							fill="#8884d8"
							dataKey="percentage"
							strokeWidth={0} // Sin borde blanco
							strokeLinecap="round" // Bordes redondeados
							paddingAngle={0} // Espacio adicional entre segmentos
						>
							{data.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={getBranchColor(entry.branch)}
									className="hover:opacity-80 transition-all duration-300 cursor-pointer hover:drop-shadow-lg"
									strokeWidth={0}
								/>
							))}
						</Pie>
						<Tooltip content={<CustomTooltip />} />
					</PieChart>
				</ResponsiveContainer>

				{/* Total en el centro del donut */}
				<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
					<div className="text-center">
						<p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-700 dark:text-gray-300">
							{formatCurrency(total)}
						</p>
						<p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total del Mes</p>
					</div>
				</div>
			</div>

			{/* Leyenda personalizada - Estilo original del SVG */}
			<div className="space-y-2 sm:space-y-3">
				{data.map((entry) => (
					<div key={entry.branch} className="flex items-center justify-between transition-transform duration-200">
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded-full" style={{ backgroundColor: getBranchColor(entry.branch) }} />
							<span className="text-sm text-gray-600 dark:text-gray-400">{entry.branch}</span>
						</div>
						<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
							{Math.round(entry.percentage)}% ({formatCurrency(entry.revenue)})
						</span>
					</div>
				))}
			</div>
		</div>
	)
}
