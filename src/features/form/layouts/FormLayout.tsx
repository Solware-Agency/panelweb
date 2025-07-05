import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import FormSidebar from './FormSidebar'
import FormHeader from './FormHeader'

interface FormLayoutProps {
	children: React.ReactNode
	activeSection: string
	onSectionChange: (section: string) => void
}

const FormLayout: React.FC<FormLayoutProps> = ({ children, activeSection, onSectionChange }) => {
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const [sidebarExpanded, setSidebarExpanded] = useState(false)
	const contentRef = useRef<HTMLDivElement>(null)

	// Close sidebar when clicking outside on mobile
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (sidebarOpen && contentRef.current && contentRef.current.contains(event.target as Node)) {
				setSidebarOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [sidebarOpen])

	const toggleSidebar = () => {
		setSidebarOpen(!sidebarOpen)
	}

	const handleSidebarMouseEnter = () => {
		setSidebarExpanded(true)
	}

	const handleSidebarMouseLeave = () => {
		setSidebarExpanded(false)
	}

	const handleSectionClick = (section: string) => {
		onSectionChange(section)
		if (window.innerWidth < 1024) {
			setSidebarOpen(false)
		}
	}

	return (
		<div className="min-h-screen bg-white dark:bg-background transition-colors duration-300 overflow-x-hidden">
			{/* Mobile overlay */}
			<AnimatePresence>
				{sidebarOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black bg-opacity-50 z-[999998] lg:hidden"
						onClick={() => setSidebarOpen(false)}
					/>
				)}
			</AnimatePresence>

			{/* Sidebar - Updated with collapsible behavior */}
			<div
				className={`fixed top-0 left-0 h-screen z-[9999999] lg:z-10 transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
					sidebarOpen ? 'translate-x-0' : '-translate-x-full'
				} ${
					// On desktop: collapsed by default (w-16), expanded on hover (w-56)
					sidebarExpanded ? 'lg:w-56' : 'lg:w-16'
				}`}
				onMouseEnter={handleSidebarMouseEnter}
				onMouseLeave={handleSidebarMouseLeave}
			>
				<FormSidebar
					onClose={() => setSidebarOpen(false)}
					isExpanded={sidebarExpanded}
					isMobile={sidebarOpen}
					onSectionClick={handleSectionClick}
					activeSection={activeSection}
				/>
			</div>

			{/* Main content - Updated margin to accommodate collapsible sidebar */}
			<main
				className={`min-h-screen flex flex-col transition-all duration-300 ease-in-out z-50 ${
					sidebarExpanded ? 'lg:ml-56' : 'lg:ml-16'
				}`}
			>
				<FormHeader onMenuClick={toggleSidebar} />
				<div className="flex-1 overflow-x-hidden" ref={contentRef}>
					{children}
				</div>
			</main>
		</div>
	)
}

export default FormLayout