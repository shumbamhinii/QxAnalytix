import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'
import { motion } from 'framer-motion'

const clients = [
  {
    id: 'CUST2009',
    name: 'Absa Bank',
    contacts: 'None\nNone',
    quotes: 0,
    invoices: 1,
    lifetimeValue: 'R698,00',
    cluster: 1,
    riskLevel: 'Low'
  }
]

export function ClientsTable () {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Client Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b'>
                  <th className='text-left p-2'>Client#</th>
                  <th className='text-left p-2'>Client Name</th>
                  <th className='text-left p-2'>Contacts</th>
                  <th className='text-left p-2'># Quotes</th>
                  <th className='text-left p-2'># Invoices</th>
                  <th className='text-left p-2'>Lifetime Value</th>
                  <th className='text-left p-2'>Cluster</th>
                  <th className='text-left p-2'>Risk Level</th>
                  <th className='text-left p-2'>Action</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(client => (
                  <tr key={client.id} className='border-b'>
                    <td className='p-2'>{client.id}</td>
                    <td className='p-2 font-medium'>{client.name}</td>
                    <td className='p-2 text-sm text-muted-foreground'>
                      {client.contacts.split('\n').map((contact, i) => (
                        <div key={i}>{contact}</div>
                      ))}
                    </td>
                    <td className='p-2'>{client.quotes}</td>
                    <td className='p-2 text-orange-600 font-medium'>
                      {client.invoices}
                    </td>
                    <td className='p-2'>{client.lifetimeValue}</td>
                    <td className='p-2'>{client.cluster}</td>
                    <td className='p-2'>
                      <Badge
                        variant='secondary'
                        className='bg-green-100 text-green-800'
                      >
                        {client.riskLevel}
                      </Badge>
                    </td>
                    <td className='p-2'>
                      <Button variant='ghost' size='sm'>
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
