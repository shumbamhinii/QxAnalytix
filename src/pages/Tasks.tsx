import React from 'react';
import { Header } from '@/components/layout/Header'; // Added Header import
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { motion } from 'framer-motion'; // Added motion import

const Tasks = () => {
  return (
    <div className='flex-1 space-y-4 p-4 md:p-6 lg:p-8'>
      <Header title='Tasks' /> {/* Added Header component */}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <KanbanBoard />
      </motion.div>
    </div>
  );
};

export default Tasks;
import { Header } from '@/components/layout/Header'
import { KanbanBoard } from '@/components/tasks/KanbanBoard'
import { motion } from 'framer-motion'

const Tasks = () => {
  return (
    <div className='flex-1 space-y-4 p-4 md:p-6 lg:p-8'>
      <Header title='Tasks' />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <KanbanBoard />
      </motion.div>
    </div>
  )
}

export default Tasks
