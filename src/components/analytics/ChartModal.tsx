import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { ChartComponent } from './ChartComponent'
import type { ChartData } from '../../pages/DataAnalytics'

interface ChartModalProps {
  isOpen: boolean
  onClose: () => void
  chart: ChartData | null
}

export function ChartModal ({ isOpen, onClose, chart }: ChartModalProps) {
  if (!chart) return null

  const modalConfig = {
    ...chart.config,
    series: [{ ...chart.config.series[0], data: chart.data }]
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[80vh] overflow-auto'>
        <DialogHeader>
          <DialogTitle>{chart.title}</DialogTitle>
        </DialogHeader>
        <div className='h-96'>
          <ChartComponent data={chart.data} config={modalConfig} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
