import { useState } from 'react'
import { Bot } from 'lucide-react'
import ChatModal from './ChatModal'

function ChatButton() {
	const [isOpen, setIsOpen] = useState(false)

	const openModal = () => {
		setIsOpen(true)
	}

	const closeModal = () => {
		setIsOpen(false)
	}

	return (
		<>
			{!isOpen && (
				<button
					onClick={openModal}
					className="flex items-center justify-center fixed bottom-6 right-6 bg-background border p-3 z-100 rounded-lg cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200"
				>
					<Bot className="size-6" />
				</button>
			)}
			<ChatModal isOpen={isOpen} onClose={closeModal} />
		</>
	)
}

export default ChatButton
