import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

interface ChartComponentProps {
  data: any[]
  config: any
}

export function ChartComponent ({ data, config }: ChartComponentProps) {
  const options = {
    ...config,
    credits: { enabled: false },
    legend: { enabled: true },
    responsive: {
      rules: [
        {
          condition: { maxWidth: 500 },
          chartOptions: {
            legend: { enabled: false }
          }
        }
      ]
    }
  }

  return <HighchartsReact highcharts={Highcharts} options={options} />
}
