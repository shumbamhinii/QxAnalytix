import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { motion } from 'framer-motion'

const QuantChat = () => {
  return (
    <div className='flex-1 flex flex-col space-y-4 p-4 md:p-6 lg:p-8'>
      <Header title='Qx Chat' />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className='flex-1'
      >
        <ChatInterface />
      </motion.div>
    </div>
  )
}

export default QuantChat
