import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { ChartGrid } from '@/components/analytics/ChartGrid'
import { ChartModal } from '@/components/analytics/ChartModal'
import { motion } from 'framer-motion'

export interface ChartData {
  id: string
  title: string
  type: 'line' | 'bar' | 'pie' | 'area' | 'column'
  data: any[]
  config: any
}

const DataAnalytics = () => {
  const [selectedChart, setSelectedChart] = useState<ChartData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleExpandChart = (chart: ChartData) => {
    setSelectedChart(chart)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedChart(null)
  }

  return (
    <div className='flex-1 space-y-4 p-4 md:p-6 lg:p-8'>
      <Header title='Data Analytics' />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ChartGrid onExpandChart={handleExpandChart} />
      </motion.div>

      <ChartModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        chart={selectedChart}
      />
    </div>
  )
}

export default DataAnalytics
