import React from 'react'
import { useChat } from "../Context/ChatContext"
import { socket } from '../Connection/Socket'

const Input = () => {

    const { userId, isSearching, setIsSearching, receiver, setReceiver, setMessages, isSending, setIsSending, message, setMessage, setIsTyping } = useChat()
    const $ = (x) => document.querySelector(x)
    let skipConfirm = false

    const newChat = () => {
        setIsSearching(true)
        setMessages([])
        socket.emit("paired", userId, (error) => {
            return
        })
        return () => {
            socket.off("paired");
        };
    }

    const skipChat = () => {

        if ($('#skipBtn').disabled) {
            return
        }
        else if (receiver) {
            if (!skipConfirm) {
                skipConfirm = true
                $('#skipBtn').innerHTML = 'Sure?<span class="hidden md:block text-sm">(Esc)</span>'
            }
            else {
                socket.emit('unpaired', receiver, () => {
                    setReceiver('')
                    setMessage('')
                    setIsTyping(false)
                })
                skipConfirm = false
                $('#skipBtn').innerHTML = 'Skip<span class="hidden md:block text-sm">(Esc)</span>'
            }
        }
    }

    const sendMessage = () => {

        if (isSending) return
        if (message === '') return
        setIsSending(true)
        socket.emit('sendMessage', receiver, message, () => {
            setMessage('')
            setIsTyping(false)
        })
        $('#chatBox').value = ''

    }

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault()
            skipChat()
        }
        else if (e.key === 'Enter') {
            e.preventDefault()
            sendMessage()
        }
        else {
            socket.emit('typing', receiver, () => {
                setIsTyping(true)
            })
        }
    }

    return (
        <div className="flex gap-2 h-[7vh]">
            {receiver || receiver !== '' || isSearching ?
                <button
                    id="skipBtn"
                    onClick={skipChat}
                    disabled={isSearching}
                    className="basis-1/5 md:basis-2/12 lg:basis-1/12 rounded-lg text-md md:text-lg shadow-md bg-sky-500 text-gray-100 md:w-24 tracking-wide cursor-pointer hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-gray-500 transition duration-500">
                    Skip<span className="hidden md:block text-sm">(Esc)</span>
                </button>
                :
                <button
                    id="newBtn"
                    onClick={newChat}
                    className="basis-1/5 md:basis-2/12 lg:basis-1/12 rounded-lg text-md md:text-lg shadow-md bg-sky-500 text-gray-100 md:w-24 tracking-wide cursor-pointer hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-gray-500 transition duration-500">
                    New<span className="hidden md:block text-sm">(Esc)</span>
                </button>
            }
            <input
                type="text"
                name="chatBox"
                id="chatBox"
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e)}
                value={message}
                className="outline-none outline-offset-0 focus:outline-sky-500 text-gray-800 px-4 text-md md:text-lg shadow-md border rounded-lg
                    basis-4/5 md:basis-4/6 lg:basis-5/6 read-only:cursor-not-allowed read-only:focus:outline-none"
                placeholder="type your message..."
                autoFocus
            />
            <button
                id="sendBtn"
                disabled={!receiver || isSearching}
                onClick={sendMessage}
                className="hidden md:block md:basis-2/12 lg:basis-1/12 rounded-lg text-md md:text-lg shadow-md bg-sky-500 text-gray-100 md:w-24 tracking-wide cursor-pointer hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-gray-500 transition duration-500">
                Send<span className="block text-sm">(Enter)</span>
            </button>
        </div>
    )
}

export default Input