import { Header } from '../components/layout/Header'
import { DashboardCharts } from '../components/dashboard/DashboardCharts'
import { StatsCards } from '../components/dashboard/StatsCards'
import { ClientsTable } from '../components/dashboard/ClientsTable'
import { motion } from 'framer-motion'

const Dashboard = () => {
  return (
    <div className='flex-1 space-y-4 p-4 md:p-6 lg:p-8'>
      <Header title='Dashboard' />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <StatsCards />
        <DashboardCharts />
        <ClientsTable />
      </motion.div>
    </div>
  )
}

export default Dashboard
